import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ReceivedQuotation } from "./received-quotation.entity";
import { Repository } from "typeorm";
import { ReceivedQuotationResponseDto } from "./dto/received-quotation.response.dto";
import { Quotation } from "src/quotation/quotation.entity";

@Injectable()
export class ReceivedQuotationService {
  constructor(
    @InjectRepository(ReceivedQuotation)
    private readonly receivedQuotationRepository: Repository<ReceivedQuotation>,
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

    const response: ReceivedQuotationResponseDto[] = [];

    for (const receivedQuotation of receivedQuotations) {
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

      response.push({
        id: receivedQuotation.id,
        isAssigned,
        moveType: quotation?.moveType,
        offerMover: {
          id: mover?.id,
          profileImageUrl: mover?.profileImage,
          nickname: mover?.nickname,
          likeCount: mover?.likeCount,
          intro: mover?.intro,
          career: mover?.career,
          isLiked: false,
          totalRating: mover?.totalRating,
          reviewCounts: mover?.reviewCounts,
          confirmedQuotationCount: mover?.confirmedCounts,
        },
        quotation: {
          id: quotation?.id,
          createdAt: quotation?.createdAt.toISOString(),
          moveDate: quotation?.moveDate,
          startAddress: quotation?.startAddress,
          endAddress: quotation?.endAddress,
        },
        price: receivedQuotation.price,
        isCompleted: receivedQuotation.isCompleted,
        isConfirmedMover: receivedQuotation.isConfirmedMover,
      });
    }

    return response;
  }

  //요청 확정하기
  async confirmReceivedQuotation(
    receivedQuotationId: string,
  ): Promise<{ id: string }> {
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
          ReceivedQuotation,
          { quotationId: targetRequest.quotationId },
          { isCompleted: true },
        );

        await manager.update(
          ReceivedQuotation,
          { id: receivedQuotationId },
          { isConfirmedMover: true },
        );

        await manager
          .createQueryBuilder()
          .update(Quotation)
          .set({ status: "confirmed", confirmedMoverId: targetRequest.moverId })
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

    const response: ReceivedQuotationResponseDto[] = [];

    for (const receivedQuotation of receivedQuotations) {
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

      response.push({
        id: receivedQuotation.id,
        isAssigned,
        moveType: quotation?.moveType,
        offerMover: {
          id: mover?.id,
          profileImageUrl: mover?.profileImage,
          nickname: mover?.nickname,
          likeCount: mover?.likeCount,
          intro: mover?.intro,
          career: mover?.career,
          isLiked: false,
          totalRating: mover?.totalRating,
          reviewCounts: mover?.reviewCounts,
          confirmedQuotationCount: mover?.confirmedCounts,
        },
        quotation: {
          id: quotation?.id,
          createdAt: quotation?.createdAt.toISOString(),
          moveDate: quotation?.moveDate,
          startAddress: quotation?.startAddress,
          endAddress: quotation?.endAddress,
        },
        price: receivedQuotation.price,
        isCompleted: receivedQuotation.isCompleted,
        isConfirmedMover: receivedQuotation.isConfirmedMover,
      });
    }

    return response;
  }

  //견적 상세 보기
  async getReceivedQuotationById(
    receivedQuotationId: string,
  ): Promise<ReceivedQuotationResponseDto> {
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

    return {
      id: receivedQuotation.id,
      isAssigned,
      moveType: quotation?.moveType,
      offerMover: {
        id: mover?.id,
        profileImageUrl: mover?.profileImage,
        nickname: mover?.nickname,
        likeCount: mover?.likeCount,
        intro: mover?.intro,
        career: mover?.career,
        isLiked: false,
        totalRating: mover?.totalRating,
        reviewCounts: mover?.reviewCounts,
        confirmedQuotationCount: mover?.confirmedCounts,
      },
      quotation: {
        id: quotation?.id,
        createdAt: quotation?.createdAt.toISOString(),
        moveDate: quotation?.moveDate,
        startAddress: quotation?.startAddress,
        endAddress: quotation?.endAddress,
      },
      price: receivedQuotation.price,
      isCompleted: receivedQuotation.isCompleted,
      isConfirmedMover: receivedQuotation.isConfirmedMover,
    };
  }
}
