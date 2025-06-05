import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Quotation } from "src/quotation/quotation.entity";
import { ReceivedQuote } from "../entities/received-quote.entity";
import { ReceivedQuotationResponseDto } from "../dtos/customer-receivedQuotation.response.dto";

@Injectable()
export class ReceivedQuotationService {
  constructor(
    @InjectRepository(ReceivedQuote)
    private readonly receivedQuotationRepository: Repository<ReceivedQuote>,
    @InjectRepository(Quotation)
    private readonly quotationRepository: Repository<Quotation>,
  ) {}

  // 일반유저 모든 진행중인 요청 조회
  async getAllPendingReceivedQuotations(): Promise<
    ReceivedQuotationResponseDto[]
  > {
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
        isLiked: false,
        confirmedQuotationCount: mover?.confirmedCounts,
        isCompleted: receivedQuotation.isCompleted,
        isConfirmedMover: receivedQuotation.isConfirmedMover,
        isReviewed: receivedQuotation.isReviewed,
      };

      if (groupedMap.has(quotationId)) {
        // 기존 quotation에 offer 추가
        groupedMap.get(quotationId)!.offers.push(offer);
      } else {
        // 새로운 quotation 생성
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
  // 일반유저 모든 완료된 요청 조회
  async getAllCompletedReceivedQuotations(): Promise<
    ReceivedQuotationResponseDto[]
  > {
    const receivedQuotations = await this.receivedQuotationRepository.find({
      where: { isCompleted: true },
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
        isLiked: false,
        confirmedQuotationCount: mover?.confirmedCounts,
        isCompleted: receivedQuotation.isCompleted,
        isConfirmedMover: receivedQuotation.isConfirmedMover,
        isReviewed: receivedQuotation.isReviewed,
      };

      if (groupedMap.has(quotationId)) {
        // 기존 quotation에 offer 추가
        groupedMap.get(quotationId)!.offers.push(offer);
      } else {
        // 새로운 quotation 생성
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
  } //견적 상세 보기
  async getReceivedQuotationById(
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
      isLiked: false,
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
