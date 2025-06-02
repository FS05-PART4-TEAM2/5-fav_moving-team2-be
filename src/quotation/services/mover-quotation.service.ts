import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, ILike, In, MoreThanOrEqual, Repository } from "typeorm";
import { Quotation } from "../quotation.entity";
import { AssignMover } from "../entities/assign-mover.entity";
import { ReceivedQuote } from "../entities/received-quote.entity";
import { ReceivedQuotationResponseDto } from "../dtos/received-quotation.response.dto";
import { ReceivedQuotationRequestDto } from "../dtos/reveived-quotation.request.dto";
import { QUOTATION_STATE_KEY } from "src/common/constants/quotation-state.constant";
import { Customer } from "src/customer/customer.entity";
import { ASSIGN_STATUS_KEY } from "src/common/constants/assign-status.constant";

@Injectable()
export class MoverQuotationService {
  constructor(
    @InjectRepository(Quotation)
    private readonly quotationRepository: Repository<Quotation>,
    @InjectRepository(AssignMover)
    private readonly assignMoverRepository: Repository<AssignMover>,
    @InjectRepository(ReceivedQuote)
    private readonly receivedQuoteRepository: Repository<ReceivedQuote>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async getReceivedQuotationList(
    user: { userId: string; userType: string },
    queries: ReceivedQuotationRequestDto,
  ): Promise<ReceivedQuotationResponseDto[]> {
    const { userId } = user;
    const { type, region, isAssigned, username, sorted } = queries;

    // 1. username으로 고객 ID 조회
    let customerId: string | undefined;
    if (username) {
      const customer = await this.customerRepository.findOne({
        where: {
          username: ILike(`%${username}%`),
        },
      });
      customerId = customer?.id;
    }

    // 2. 견적 조회: QueryBuilder 사용
    const regionList = region?.split(",") ?? [];
    const today = new Date();

    const qb = this.quotationRepository.createQueryBuilder("quotation");

    qb.where("quotation.status = :status", {
      status: QUOTATION_STATE_KEY.PENDING,
    }).andWhere("quotation.moveDate >= :today", { today });

    if (customerId) {
      qb.andWhere("quotation.customerId = :customerId", { customerId });
    }

    if (type) {
      const typeList = type.split(",");
      qb.andWhere("quotation.moveType IN (:...typeList)", { typeList });
    }

    if (regionList.length > 0) {
      qb.andWhere(
        new Brackets((qb) => {
          regionList.forEach((region, i) => {
            qb.orWhere("quotation.startAddress LIKE :region" + i, {
              ["region" + i]: `%${region}%`,
            });
            qb.orWhere("quotation.endAddress LIKE :region" + i, {
              ["region" + i]: `%${region}%`,
            });
          });
        }),
      );
    }

    qb.orderBy(
      sorted === "REQUEST_DATE_ASC"
        ? "quotation.createdAt"
        : "quotation.moveDate",
      "ASC",
    );

    const quotations = await qb.getMany();

    // 3. 현재 기사님에게 지정된 요청 조회
    const assignMover = await this.assignMoverRepository.find({
      where: {
        moverId: userId,
        createdAt: MoreThanOrEqual(today),
        status: ASSIGN_STATUS_KEY.PENDING,
      },
    });

    const assignedQuotationIdSet = new Set(
      assignMover.map((a) => a.quotationId),
    );

    // 4. 고객 정보 조회
    const customerIds = Array.from(
      new Set(quotations.map((q) => q.customerId)),
    );
    const customers = await this.customerRepository.findBy({
      id: In(customerIds),
    });
    const customerMap = new Map(customers.map((c) => [c.id, c]));

    // 5. isAssigned 조건으로 필터링
    const filteredQuotations =
      isAssigned === undefined
        ? quotations
        : quotations.filter((q) => {
            const matched = assignedQuotationIdSet.has(q.id);
            return isAssigned ? matched : !matched;
          });

    // 6. 응답 생성
    const result = filteredQuotations.map((q) =>
      ReceivedQuotationResponseDto.of(
        q,
        assignedQuotationIdSet.has(q.id),
        customerMap.get(q.customerId),
      ),
    );

    return result;
  }
}
