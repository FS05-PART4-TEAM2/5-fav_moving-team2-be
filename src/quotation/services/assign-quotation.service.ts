import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AssignMover } from "../entities/assign-mover.entity";
import { Repository } from "typeorm";
import { Quotation } from "../quotation.entity";
import {
  PaginatedScrollResponseDto,
  PaginationDto,
} from "src/common/dto/pagination.dto";
import { ReceivedQuote } from "../entities/received-quote.entity";
import { Customer } from "src/customer/customer.entity";
import { GetRejectedData } from "../dtos/get-rejected-Data.response.dto";

@Injectable()
export class AssignQuotationService {
  constructor(
    @InjectRepository(AssignMover)
    private assignMoverRepository: Repository<AssignMover>,
    @InjectRepository(Quotation)
    private quotationRepository: Repository<Quotation>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async postAssignMover(
    userId: string,
    userType: string,
    moverId: string,
  ): Promise<AssignMover> {
    // userType이 mover라면 에러
    if (userType === "mover") {
      throw new UnauthorizedException(
        "기사 계정으로는 지정 기사 요청을 할 수 없습니다.",
      );
    }
    // userId에 해당하는 quotation을 찾아본다
    const quotation = await this.quotationRepository.findOne({
      where: {
        customerId: userId,
        status: "PENDING", // 아직 진행중인 견적일 때
      },
    });

    if (!quotation) {
      throw new NotFoundException("견적 요청을 먼저 진행해주세요.");
    }

    const isExistsAssign = await this.assignMoverRepository.exists({
      where: {
        moverId,
        customerId: userId,
      },
    });

    if (isExistsAssign) {
      throw new BadRequestException("이미 지정한 기사입니다.");
    }

    // 찾은 quotationId, moverId 바탕으로 assignMover 생성
    const newAssignMover = this.assignMoverRepository.create({
      moverId,
      quotationId: quotation?.id,
      customerId: userId,
      status: "PENDING",
    });

    await this.assignMoverRepository.save(newAssignMover);

    return newAssignMover;
  }

  async getRejectRequestList(
    userId: string,
    userType: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedScrollResponseDto<GetRejectedData>> {
    // mover가 아닐 때
    if (userType !== "mover") {
      throw new UnauthorizedException("기사 전용 API입니다.");
    }

    const { page, limit } = paginationDto;
    const safePage = Math.max(page, 1);
    const skip = (safePage - 1) * limit;

    const [rejectedRequests, total] = await Promise.all([
      this.assignMoverRepository
        .createQueryBuilder("a")
        .innerJoin("customer", "c", "a.customerId = c.id::text")
        .innerJoin("quotation", "q", "a.quotationId = q.id::text")
        .where(`a.moverId = :moverId::text`, { moverId: userId })
        .andWhere("a.status = :status", { status: "REJECTED" })
        .select([
          `a.id AS "id"`,
          `c.username AS "customerNick"`,
          `q.moveType AS "moveType"`,
          `q.startAddress AS "startAddress"`,
          `q.endAddress AS "endAddress"`,
          `q.moveDate AS "moveDate"`,
        ])
        .orderBy("a.createdAt", "DESC")
        .take(limit)
        .skip(skip)
        .getRawMany(),

      this.assignMoverRepository
        .createQueryBuilder("a")
        .where("a.moverId = :moverId", { moverId: userId })
        .andWhere("a.status = :status", { status: "REJECTED" })
        .getCount(),
    ]);

    const data = rejectedRequests.map((row) => new GetRejectedData(row));
    return new PaginatedScrollResponseDto(data, total, safePage, limit);
  }
}
