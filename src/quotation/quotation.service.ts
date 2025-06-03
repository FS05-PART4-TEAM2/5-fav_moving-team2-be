import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Quotation } from "./quotation.entity";
import { Repository } from "typeorm";
import { CustomerCreateQuotationRequestDto } from "src/common/dto/quotation.request.dto";
import {
  ServiceTypeKey,
  SERVICE_TYPES,
} from "src/common/constants/service-type.constant";
import { RegionKey } from "src/common/constants/region.constant";

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
}
