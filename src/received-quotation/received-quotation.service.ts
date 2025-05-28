import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ReceivedQuotation } from "./received-quotation.entity";
import { Repository } from "typeorm";
import { ReceivedQuotationResponseDto } from "./dto/received-quotation.response.dto";

@Injectable()
export class ReceivedQuotationService {
  constructor(
    @InjectRepository(ReceivedQuotation)
    private readonly receivedQuotationRepository: Repository<ReceivedQuotation>,
  ) {}
  async getAllReceivedQuotations(): Promise<ReceivedQuotationResponseDto[]> {
    // 1. receivedQuotation 데이터 조회
    const receivedQuotations = await this.receivedQuotationRepository.find();

    // 2. 각 receivedQuotation에 대해 관련 데이터 조회 및 매핑
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

      response.push({
        id: receivedQuotation.id,
        offerMover: {
          id: mover?.id,
          username: mover?.username,
          likeCount: mover?.likeCount,
          totalRating: mover?.totalRating,
          reviewCounts: mover?.reviewCounts,
          completedQuotationCount: 0,
        },
        quotation: {
          id: quotation?.id,
          moveType: quotation?.moveType,
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
}
