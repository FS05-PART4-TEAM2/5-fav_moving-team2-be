import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Quotation } from "./quotation.entity";
import { Between, Repository } from "typeorm";
import { CustomerCreateQuotationRequestDto } from "src/common/dto/quotation.request.dto";
import {
  ServiceTypeKey,
  SERVICE_TYPES,
} from "src/common/constants/service-type.constant";
import { RegionKey } from "src/common/constants/region.constant";
import { QUOTATION_STATE_KEY } from "src/common/constants/quotation-state.constant";
import { format } from "date-fns";
import { ReceivedQuote } from "./entities/received-quote.entity";

@Injectable()
export class QuotationService {
  constructor(
    @InjectRepository(Quotation)
    private readonly quotationRepository: Repository<Quotation>,
    @InjectRepository(ReceivedQuote)
    private readonly receivedQuoteRepository: Repository<ReceivedQuote>,
  ) {}

  async createQuotation(
    quotationDto: CustomerCreateQuotationRequestDto,
  ): Promise<Quotation> {
    const { moveType, moveDate, startAddress, endAddress, customerId } =
      quotationDto;

    const validMoveTypes = SERVICE_TYPES.map((type) => type.key);
    if (!validMoveTypes.includes(moveType as ServiceTypeKey)) {
      throw new BadRequestException(
        `올바르지않은 요청: ${moveType}. 요청 가능한 타입: ${validMoveTypes.join(
          ", ",
        )}`,
      );
    }

    const newQuotation = this.quotationRepository.create({
      moveType: moveType as ServiceTypeKey,
      moveDate: new Date(moveDate).toISOString(),
      startAddress: startAddress as RegionKey,
      endAddress: endAddress as RegionKey,
      customerId,
    });

    return this.quotationRepository.save(newQuotation);
  }

  async getAllQuotations(
    page: number,
    limit: number,
  ): Promise<{ data: Quotation[]; total: number }> {
    const [data, total] = await this.quotationRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: "DESC",
      },
    });

    return { data, total };
  }

  /**
   *
   */
  async getConfirmedQuotationsByDate(date: Date): Promise<Quotation[]> {
    const dateString = format(date, "yyyy-MM-dd");

    return this.quotationRepository
      .createQueryBuilder("quotation")
      .where("quotation.status = :status", {
        status: QUOTATION_STATE_KEY.CONFIRMED,
      })
      .andWhere("quotation.moveDate::date = :date", { date: dateString })
      .getMany();
  }

  /**
   *
   */
  //
  async getReceivedQuoteByQuotationIdAndConfirmedMover(
    quotationId: string,
    isConfirmedMover: true,
  ): Promise<ReceivedQuote | null> {
    return await this.receivedQuoteRepository.findOne({
      where: {
        quotationId,
        isConfirmedMover,
      },
    });
  }
}
