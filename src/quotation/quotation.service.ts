import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Quotation } from "./quotation.entity";
import { Repository } from "typeorm";
import { CustomerCreateQuotationRequestDto } from "src/common/dto/quotation.requst.dto";

@Injectable()
export class QuotationService {
  constructor(
    @InjectRepository(Quotation)
    private readonly quotationRepository: Repository<Quotation>,
  ) {}

  async createQuotation(
    quotationDto: CustomerCreateQuotationRequestDto,
  ): Promise<Quotation> {
    const { moveType, moveDate, startAddress, endAddress, customerId } =
      quotationDto;

    const newQuotation = this.quotationRepository.create({
      moveType,
      moveDate,
      startAddress,
      endAddress,
      customerId,
    });

    return this.quotationRepository.save(newQuotation);
  }
}
