import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Quotation } from "src/quotation/quotation.entity";
import { ReceivedQuote } from "../entities/received-quote.entity";
import { ReceivedQuotationResponseDto } from "../dtos/customer-receivedQuotation.response.dto";
import { NotificationService } from "src/notifications/notification.service";
import { NotificationTextSegment } from "src/notifications/notification.entity";
import { Mover } from "src/mover/mover.entity";
import { InvalidUserException } from "src/common/exceptions/invalid-user.exception";
import { LikeMover } from "src/likeMover/likeMover.entity";
import { Customer } from "src/customer/customer.entity";
import { StorageService } from "@/common/interfaces/storage.service";

@Injectable()
export class ReceivedQuotationService {
  constructor(
    @InjectRepository(ReceivedQuote)
    private readonly receivedQuotationRepository: Repository<ReceivedQuote>,
    @InjectRepository(Mover)
    private readonly moverRepository: Repository<Mover>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Quotation)
    private readonly quotationRepository: Repository<Quotation>,
    private readonly notificationService: NotificationService,
    @InjectRepository(LikeMover)
    private readonly likeMoverRepository: Repository<LikeMover>,
    @Inject("StorageService")
    private readonly storageService: StorageService,
  ) {}
  // 일반유저 모든 진행중인 요청 조회
  async getAllPendingReceivedQuotations(
    customerId: string,
  ): Promise<ReceivedQuotationResponseDto[]> {
    const receivedQuotations = await this.receivedQuotationRepository.find({
      where: { isCompleted: false, customerId: customerId },
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

      let profileImage = mover?.profileImage || null;

      if (
        typeof this.storageService.getSignedUrlFromS3Url === "function" &&
        profileImage !== null
      ) {
        profileImage =
          await this.storageService.getSignedUrlFromS3Url(profileImage);
      }

      const offer = {
        offerId: receivedQuotation.id,
        moverId: mover?.id,
        moverNickname: mover?.nickname,
        moverProfileImageUrl: profileImage,
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
    customerId: string,
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

    const mover = await this.moverRepository.findOne({
      where: { id: targetRequest?.moverId },
    });
    const customer = await this.customerRepository.findOne({
      where: {
        id: targetRequest?.customerId,
      },
    });

    if (targetRequest?.customerId !== customerId) {
      throw new BadRequestException("본인 요청만 확정할 수 있습니다.");
    }
    if (!targetRequest) {
      throw new NotFoundException("해당 견적을 찾을 수 없음");
    }

    if (targetRequest.isCompleted) {
      throw new BadRequestException("이미 완료된 견적입니다.");
    }

    if (!mover) {
      throw new InvalidUserException();
    }
    if (!customer) {
      throw new InvalidUserException();
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
            status: "CONFIRMED",
            confirmedMoverId: targetRequest.moverId,
            price: targetRequest.price.toString(),
          })
          .where("id = :quotationId", {
            quotationId: targetRequest.quotationId,
          })
          .execute();

        await manager.update(
          Mover,
          { id: targetRequest.moverId },
          { confirmedCounts: () => "confirmedCounts + 1" },
        );
      },
    );

    // 알림 생성
    const toMoverNotiSegments: NotificationTextSegment[] = [
      {
        text: `${customer.username} 님께 보낸 견적이 `,
        isHighlight: false,
      },
      {
        text: `확정`,
        isHighlight: true,
      },
      {
        text: `되었어요`,
        isHighlight: false,
      },
    ];
    const toCustomerNotiSegments: NotificationTextSegment[] = [
      {
        text: `${mover.nickname}(${mover.username}) 님이 보낸 견적을 `,
        isHighlight: false,
      },
      {
        text: `확정`,
        isHighlight: true,
      },
      {
        text: `했어요`,
        isHighlight: false,
      },
    ];
    await this.notificationService.createNotification(mover.id, {
      type: "QUOTE_CONFIRMED",
      segments: toMoverNotiSegments,
      receivedQuoteId: targetRequest.id,
    });
    await this.notificationService.createNotification(
      targetRequest.customerId,
      {
        type: "QUOTE_CONFIRMED",
        segments: toCustomerNotiSegments,
        receivedQuoteId: targetRequest.id,
      },
    );

    return {
      id: receivedQuotationId,
    };
  }

  async getAllCompletedReceivedQuotations(
    customerId: string,
  ): Promise<ReceivedQuotationResponseDto[]> {
    const receivedQuotations = await this.receivedQuotationRepository.find({
      where: { isCompleted: true, customerId },
      order: { createdAt: "DESC" },
    });

    if (receivedQuotations.length === 0) {
      return [];
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

      let profileImage = mover?.profileImage || null;

      if (
        typeof this.storageService.getSignedUrlFromS3Url === "function" &&
        profileImage !== null
      ) {
        profileImage =
          await this.storageService.getSignedUrlFromS3Url(profileImage);
      }

      const offer = {
        offerId: receivedQuotation.id,
        moverId: mover?.id,
        moverNickname: mover?.nickname,
        moverProfileImageUrl: profileImage,
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

    if (receivedQuotation.customerId !== customerId) {
      throw new BadRequestException("본인 요청만 조회할 수 있습니다.");
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

    let profileImage = mover?.profileImage || null;

    if (
      typeof this.storageService.getSignedUrlFromS3Url === "function" &&
      profileImage !== null
    ) {
      profileImage =
        await this.storageService.getSignedUrlFromS3Url(profileImage);
    }

    const offer = {
      offerId: receivedQuotation.id,
      moverId: mover?.id,
      moverNickname: mover?.nickname,
      moverProfileImageUrl: profileImage,
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
