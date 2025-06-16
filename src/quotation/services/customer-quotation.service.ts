import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Quotation } from "src/quotation/quotation.entity";
import { ReceivedQuote } from "../entities/received-quote.entity";
import { ReceivedQuotationResponseDto } from "../dtos/customer-receivedQuotation.response.dto";
import { PaginatedResponseDto } from "src/common/dto/pagination.dto";
import { LikeMover } from "src/likeMover/likeMover.entity";

@Injectable()
export class ReceivedQuotationService {
  constructor(
    @InjectRepository(ReceivedQuote)
    private readonly receivedQuotationRepository: Repository<ReceivedQuote>,
    @InjectRepository(Quotation)
    private readonly quotationRepository: Repository<Quotation>,
    @InjectRepository(LikeMover)
    private readonly likeMoverRepository: Repository<LikeMover>,
  ) {}
  // 일반유저 모든 진행중인 요청 조회
  async getAllPendingReceivedQuotations(
    customerId: string,
  ): Promise<ReceivedQuotationResponseDto[]> {
    const receivedQuotations = await this.receivedQuotationRepository.find({
      where: { isCompleted: false },
    });

    if (receivedQuotations.length === 0) {
      return [];
    }

    // 필요한 ID들 수집
    const moverIds = [...new Set(receivedQuotations.map((rq) => rq.moverId))];
    const quotationIds = [
      ...new Set(receivedQuotations.map((rq) => rq.quotationId)),
    ];

    // 한 번에 Mover 조회
    const movers = await this.receivedQuotationRepository.manager
      .createQueryBuilder("mover", "mover")
      .where("mover.id IN (:...moverIds)", { moverIds })
      .getMany();

    // 한 번에 Quotation 조회
    const quotations = await this.receivedQuotationRepository.manager
      .createQueryBuilder("quotation", "quotation")
      .where("quotation.id IN (:...quotationIds)", { quotationIds })
      .getMany();

    // 찜한 기사들 조회 (IN 조건을 위해 FindOperator 사용)
    const likedMovers = await this.likeMoverRepository.find({
      where: {
        customerId,
        ...(moverIds.length > 0 && { moverId: In(moverIds) }),
      },
    });
    const likedMoverIds = new Set(likedMovers.map((like) => like.moverId));

    // Map으로 빠른 조회를 위한 인덱스 생성
    const moverMap = new Map(movers.map((mover) => [mover.id, mover]));
    const quotationMap = new Map(
      quotations.map((quotation) => [quotation.id, quotation]),
    );

    // quotationId별로 그룹화
    const groupedMap = new Map<string, ReceivedQuotationResponseDto>();

    for (const receivedQuotation of receivedQuotations) {
      const quotationId = receivedQuotation.quotationId;
      const mover = moverMap.get(receivedQuotation.moverId);
      const quotation = quotationMap.get(receivedQuotation.quotationId);

      const isAssigned = quotation?.assignMover
        ? quotation.assignMover.includes(receivedQuotation.moverId)
        : false;

      const offer = {
        offerId: receivedQuotation.id,
        moverId: mover?.id,
        moverNickname: mover?.nickname,
        moverProfileImageUrl: mover?.profileImage,
        isAssigned,
        price: receivedQuotation.price.toString(),
        likeCount: mover?.likeCount,
        totalRating: mover?.totalRating,
        reviewCounts: mover?.reviewCounts,
        intro: mover?.intro,
        career: mover?.career,
        isLiked: likedMoverIds.has(receivedQuotation.moverId),
        confirmedQuotationCount: mover?.confirmedCounts,
        isCompleted: receivedQuotation.isCompleted,
        isConfirmedMover: receivedQuotation.isConfirmedMover,
        isReviewed: receivedQuotation.isReviewed,
      };

      if (groupedMap.has(quotationId)) {
        groupedMap.get(quotationId)!.offers.push(offer);
      } else {
        groupedMap.set(quotationId, {
          quotationId: quotation?.id,
          requestedAt: quotation?.createdAt.toISOString(),
          moveType: quotation?.moveType,
          moveDate: quotation?.moveDate,
          startAddress: quotation?.startAddress,
          endAddress: quotation?.endAddress,
          offers: [offer],
        });
      }
    }

    return Array.from(groupedMap.values());
  }
  //요청 확정하기
  async confirmReceivedQuotation(
    receivedQuotationId: string,
  ): Promise<{ id: string }> {
    // UUID 형식 검증
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(receivedQuotationId)) {
      throw new BadRequestException("유효하지 않은 견적 ID 형식입니다.");
    }

    const targetRequest = await this.receivedQuotationRepository.findOne({
      where: { id: receivedQuotationId },
    });

    if (!targetRequest) {
      throw new NotFoundException("해당 견적을 찾을 수 없음");
    }

    if (targetRequest.isCompleted) {
      throw new BadRequestException("이미 완료된 견적입니다.");
    }

    await this.receivedQuotationRepository.manager.transaction(
      async (manager) => {
        await manager.update(
          ReceivedQuote,
          { quotationId: targetRequest.quotationId },
          { isCompleted: true },
        );

        await manager.update(
          ReceivedQuote,
          { id: receivedQuotationId },
          { isConfirmedMover: true },
        );
        await manager
          .createQueryBuilder()
          .update(Quotation)
          .set({
            status: "confirmed",
            confirmedMoverId: targetRequest.moverId,
            price: targetRequest.price.toString(),
          })
          .where("id = :quotationId", {
            quotationId: targetRequest.quotationId,
          })
          .execute();
      },
    );
    return {
      id: receivedQuotationId,
    };
  }
  async getAllCompletedReceivedQuotations(
    customerId: string,
    page: number = 1,
    limit: number = 6,
  ): Promise<
    PaginatedResponseDto<ReceivedQuotationResponseDto> & {
      currentPage: number;
      totalPages: number;
    }
  > {
    const receivedQuotations = await this.receivedQuotationRepository.find({
      where: { isCompleted: true },
      order: {
        createdAt: "DESC",
      },
    });

    if (receivedQuotations.length === 0) {
      return {
        data: [],
        total: 0,
        currentPage: page,
        totalPages: 0,
      };
    }

    const moverIds = [...new Set(receivedQuotations.map((rq) => rq.moverId))];
    const quotationIds = [
      ...new Set(receivedQuotations.map((rq) => rq.quotationId)),
    ];

    const movers = await this.receivedQuotationRepository.manager
      .createQueryBuilder("mover", "mover")
      .where("mover.id IN (:...moverIds)", { moverIds })
      .getMany();

    const quotations = await this.receivedQuotationRepository.manager
      .createQueryBuilder("quotation", "quotation")
      .where("quotation.id IN (:...quotationIds)", { quotationIds })
      .getMany();

    const likedMovers = await this.likeMoverRepository.find({
      where: {
        customerId,
        ...(moverIds.length > 0 && { moverId: In(moverIds) }),
      },
    });
    const likedMoverIds = new Set(likedMovers.map((like) => like.moverId));

    const moverMap = new Map(movers.map((mover) => [mover.id, mover]));
    const quotationMap = new Map(
      quotations.map((quotation) => [quotation.id, quotation]),
    );

    const groupedMap = new Map<string, ReceivedQuotationResponseDto>();

    for (const receivedQuotation of receivedQuotations) {
      const quotationId = receivedQuotation.quotationId;
      const mover = moverMap.get(receivedQuotation.moverId);
      const quotation = quotationMap.get(receivedQuotation.quotationId);

      const isAssigned = quotation?.assignMover
        ? quotation.assignMover.includes(receivedQuotation.moverId)
        : false;

      const offer = {
        offerId: receivedQuotation.id,
        moverId: mover?.id,
        moverNickname: mover?.nickname,
        moverProfileImageUrl: mover?.profileImage,
        isAssigned,
        price: receivedQuotation.price.toString(),
        likeCount: mover?.likeCount,
        totalRating: mover?.totalRating,
        reviewCounts: mover?.reviewCounts,
        intro: mover?.intro,
        career: mover?.career,
        isLiked: likedMoverIds.has(receivedQuotation.moverId),
        confirmedQuotationCount: mover?.confirmedCounts,
        isCompleted: receivedQuotation.isCompleted,
        isConfirmedMover: receivedQuotation.isConfirmedMover,
        isReviewed: receivedQuotation.isReviewed,
      };

      if (groupedMap.has(quotationId)) {
        groupedMap.get(quotationId)!.offers.push(offer);
      } else {
        groupedMap.set(quotationId, {
          quotationId: quotation?.id,
          requestedAt: quotation?.createdAt.toISOString(),
          moveType: quotation?.moveType,
          moveDate: quotation?.moveDate,
          startAddress: quotation?.startAddress,
          endAddress: quotation?.endAddress,
          offers: [offer],
        });
      }
    }
    const allOffers = Array.from(groupedMap.values()).flatMap(
      (quotation) => quotation.offers,
    );
    const totalCount = allOffers.length;
    const totalPages = Math.ceil(totalCount / limit);
    if (page > totalPages && totalPages > 0) {
      return {
        data: [
          {
            quotationId: Array.from(groupedMap.values())[0]?.quotationId,
            requestedAt: Array.from(groupedMap.values())[0]?.requestedAt,
            moveType: Array.from(groupedMap.values())[0]?.moveType,
            moveDate: Array.from(groupedMap.values())[0]?.moveDate,
            startAddress: Array.from(groupedMap.values())[0]?.startAddress,
            endAddress: Array.from(groupedMap.values())[0]?.endAddress,
            offers: [],
          },
        ],
        total: totalCount,
        currentPage: page,
        totalPages,
      };
    }
    const offset = (page - 1) * limit;
    const paginatedOffers = allOffers.slice(offset, offset + limit);

    const firstQuotation = Array.from(groupedMap.values())[0];

    if (!firstQuotation) {
      return {
        data: [],
        total: totalCount,
        currentPage: page,
        totalPages,
      };
    }

    const result: ReceivedQuotationResponseDto[] = [
      {
        quotationId: firstQuotation.quotationId,
        requestedAt: firstQuotation.requestedAt,
        moveType: firstQuotation.moveType,
        moveDate: firstQuotation.moveDate,
        startAddress: firstQuotation.startAddress,
        endAddress: firstQuotation.endAddress,
        offers: paginatedOffers,
      },
    ];

    return {
      data: result,
      total: totalCount,
      currentPage: page,
      totalPages,
    };
  }
  async getReceivedQuotationById(
    customerId: string,
    receivedQuotationId: string,
  ): Promise<ReceivedQuotationResponseDto> {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(receivedQuotationId)) {
      throw new BadRequestException("유효하지 않은 견적 ID 형식입니다.");
    }

    const receivedQuotation = await this.receivedQuotationRepository.findOne({
      where: { id: receivedQuotationId },
    });

    if (!receivedQuotation) {
      throw new NotFoundException("해당 견적 요청을 찾을 수 없음");
    }

    const mover = await this.receivedQuotationRepository.manager
      .createQueryBuilder("mover", "mover")
      .where("mover.id = :moverId", { moverId: receivedQuotation.moverId })
      .getOne();

    const quotation = await this.receivedQuotationRepository.manager
      .createQueryBuilder("quotation", "quotation")
      .where("quotation.id = :quotationId", {
        quotationId: receivedQuotation.quotationId,
      })
      .getOne();

    const isAssigned = quotation?.assignMover
      ? quotation.assignMover.includes(receivedQuotation.moverId)
      : false;

    const liked = await this.likeMoverRepository.findOne({
      where: {
        customerId,
        moverId: receivedQuotation.moverId,
      },
    });

    const offer = {
      offerId: receivedQuotation.id,
      moverId: mover?.id,
      moverNickname: mover?.nickname,
      moverProfileImageUrl: mover?.profileImage,
      isAssigned,
      price: receivedQuotation.price.toString(),
      likeCount: mover?.likeCount,
      totalRating: mover?.totalRating,
      reviewCounts: mover?.reviewCounts,
      intro: mover?.intro,
      career: mover?.career,
      isLiked: !!liked,
      confirmedQuotationCount: mover?.confirmedCounts,
      isCompleted: receivedQuotation.isCompleted,
      isConfirmedMover: receivedQuotation.isConfirmedMover,
      isReviewed: receivedQuotation.isReviewed,
    };

    return {
      quotationId: quotation?.id,
      requestedAt: quotation?.createdAt.toISOString(),
      moveType: quotation?.moveType,
      moveDate: quotation?.moveDate,
      startAddress: quotation?.startAddress,
      endAddress: quotation?.endAddress,
      offers: [offer],
    };
  }
}
