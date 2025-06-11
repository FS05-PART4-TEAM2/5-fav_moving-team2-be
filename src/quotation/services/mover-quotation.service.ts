import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, ILike, In, MoreThanOrEqual, Not, Repository } from "typeorm";
import { Quotation } from "../quotation.entity";
import { AssignMover } from "../entities/assign-mover.entity";
import { ReceivedQuote } from "../entities/received-quote.entity";
import { QuotationResponseDto } from "../dtos/quotation.response.dto";
import { GetQuotationListRequestDto } from "../dtos/get-quotation-list.request.dto";
import { QUOTATION_STATE_KEY } from "src/common/constants/quotation-state.constant";
import { Customer } from "src/customer/customer.entity";
import { ASSIGN_STATUS_KEY } from "src/common/constants/assign-status.constant";
import {
  getRegionLabelByKey,
  RegionKey,
  RegionLabel,
} from "src/common/constants/region.constant";
import { CreateReceivedQuotationDto } from "../dtos/create-received-quotation.request.dto";
import { InvalidQuotationException } from "src/common/exceptions/invalid-quotation.exception";
import { InvalidUserException } from "src/common/exceptions/invalid-user.exception";
import { ReceivedQuoteResponseDto } from "../dtos/received-quotation.response.dto";
import {
  PaginatedScrollResponseDto,
  PaginationDto,
} from "src/common/dto/pagination.dto";
import {
  SentQuotationDetailResponse,
  SentQuotationResponseData,
} from "../dtos/get-sent-quotation.response";
import { CursorDto, PagedResponseDto } from "src/common/dto/paged.response.dto";

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

  /**
   *
   * @param user
   * @param queries
   * @returns
   */
  async getReceivedQuotationList(
    user: { userId: string; userType: string },
    queries: GetQuotationListRequestDto,
  ): Promise<PagedResponseDto<QuotationResponseDto>> {
    const { userId } = user;
    const {
      type,
      region,
      isAssigned,
      username,
      sorted,
      cursorDate,
      cursorId,
      take,
    } = queries;

    let customerId: string | undefined;
    if (username) {
      const customer = await this.customerRepository.findOne({
        where: { username: ILike(`%${username}%`) },
      });
      customerId = customer?.id;
    }

    const today = new Date();
    const regionKeys = region?.split(",") ?? [];
    const regionLabels = regionKeys
      .map((key) => getRegionLabelByKey(key as RegionKey))
      .filter((label): label is RegionLabel => !!label);

    const limit = Number(take ?? 10);

    // 1. 현재 기사님에게 지정된 요청 조회
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

    const qb = this.quotationRepository.createQueryBuilder("quotation");

    // 기본 조건
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

    if (regionLabels.length > 0) {
      qb.andWhere(
        new Brackets((qb) => {
          regionLabels.forEach((label, i) => {
            qb.orWhere("quotation.startAddress LIKE :region" + i, {
              ["region" + i]: `%${label}%`,
            });
            qb.orWhere("quotation.endAddress LIKE :region" + i, {
              ["region" + i]: `%${label}%`,
            });
          });
        }),
      );
    }

    // 2. isAssigned 필터링을 데이터베이스 레벨에서 처리
    if (isAssigned !== undefined) {
      if (isAssigned === "true") {
        if (assignedQuotationIdSet.size > 0) {
          qb.andWhere("quotation.id IN (:...assignedIds)", {
            assignedIds: Array.from(assignedQuotationIdSet),
          });
        } else {
          // 지정된 견적이 없으면 빈 결과 반환
          qb.andWhere("1 = 0");
        }
      } else {
        if (assignedQuotationIdSet.size > 0) {
          qb.andWhere("quotation.id NOT IN (:...assignedIds)", {
            assignedIds: Array.from(assignedQuotationIdSet),
          });
        }
      }
    }

    // 3. 정렬 기준 설정
    let orderField = "quotation.moveDate";
    let needCustomerJoin = false;

    if (sorted === "REQUEST_DATE_ASC") {
      orderField = "quotation.createdAt";
    } else if (sorted === "USERNAME_ASC") {
      orderField = "customer.username";
      needCustomerJoin = true;
    }

    if (needCustomerJoin) {
      qb.leftJoin("quotation.customer", "customer");
    }

    qb.orderBy(orderField, "ASC").addOrderBy("quotation.id", "ASC");

    // 4. 커서 기반 필터링
    if (cursorDate && cursorId) {
      if (sorted === "USERNAME_ASC") {
        // 문자열 비교
        qb.andWhere(
          new Brackets((qb) => {
            qb.where(`${orderField} > :cursorValue`, {
              cursorValue: cursorDate,
            });
            qb.orWhere(
              `${orderField} = :cursorValue AND quotation.id > :cursorId`,
              {
                cursorValue: cursorDate,
                cursorId,
              },
            );
          }),
        );
      } else {
        // 날짜 비교
        qb.andWhere(
          new Brackets((qb) => {
            qb.where(`${orderField} > :cursorDate`, { cursorDate });
            qb.orWhere(
              `${orderField} = :cursorDate AND quotation.id > :cursorId`,
              {
                cursorDate,
                cursorId,
              },
            );
          }),
        );
      }
    }

    // 5. 여유분을 두고 데이터 조회 (필터링으로 인한 데이터 부족 방지)
    qb.take(limit);

    const quotations = await qb.getMany();

    // 6. 고객 정보 조회 (USERNAME_ASC가 아닐 때도 필요)
    const customerIds = Array.from(
      new Set(quotations.map((q) => q.customerId)),
    );
    const customers = await this.customerRepository.findBy({
      id: In(customerIds),
    });
    const customerMap = new Map(customers.map((c) => [c.id, c]));

    // 7. 응답 생성
    const result = quotations.map((q) =>
      QuotationResponseDto.of(
        q,
        assignedQuotationIdSet.has(q.id),
        customerMap.get(q.customerId),
      ),
    );

    // 8. 다음 커서 생성
    let nextCursor: CursorDto | null = null;
    if (result.length === limit) {
      const lastQuotation = quotations[quotations.length - 1];

      // 정렬 기준에 따라 date 값 선택
      let dateField: Date | string;
      if (sorted === "REQUEST_DATE_ASC") {
        dateField = lastQuotation.createdAt;
      } else if (sorted === "USERNAME_ASC") {
        const customer = customerMap.get(lastQuotation.customerId);
        dateField = customer?.username || "";
      } else {
        dateField = lastQuotation.moveDate;
      }

      nextCursor = {
        cursorId: lastQuotation.id,
        cursorDate:
          typeof dateField === "string" ? dateField : dateField.toISOString(),
      };
    }

    return PagedResponseDto.of(result, nextCursor);
  }

  /**
   * @TODO quotationId - quotation 유효성 검사
   * @TODO customerId - customer 유효성 검사
   * @TODO isAssignQuo - 지정 여부 확인
   * @TODO 견적 보내기 - ReceivedQuote 저장
   */
  async createReceivedQuotation(
    user: { userId: string; userType: string },
    request: CreateReceivedQuotationDto,
  ): Promise<ReceivedQuoteResponseDto> {
    console.log(user);
    console.log(request);

    const { userId, userType } = user;
    const { price, comment, isAssignQuo, customerId, quotationId } = request;

    // 1. 견적 유효성 확인
    const quotation = await this.quotationRepository.findOne({
      where: {
        id: quotationId,
      },
    });
    if (!quotation)
      throw new InvalidQuotationException("유효하지 않은 견적입니다.");

    // 2. 고객 유효성 확인
    const customer = await this.customerRepository.findOne({
      where: {
        id: customerId,
      },
    });
    if (!customer) throw new InvalidUserException();

    // 3. 지정 여부 확인
    const assignMover = await this.assignMoverRepository.findOne({
      where: {
        moverId: userId,
        customerId: customerId,
        quotationId: quotationId,
      },
    });
    if (isAssignQuo && !assignMover)
      throw new InvalidQuotationException("지정 견적 요청건이 아닙니다.");

    // 4. 견적 보내기
    const receivedQuote = this.receivedQuoteRepository.create({
      price,
      comment,
      isAssignQuo,
      moverId: userId,
      customerId,
      quotationId,
    });
    const newReceivedQuote =
      await this.receivedQuoteRepository.save(receivedQuote);

    const result = ReceivedQuoteResponseDto.of(newReceivedQuote);

    return result;
  }

  async getSentQuotationList(
    userId: string,
    userType: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedScrollResponseDto<SentQuotationResponseData>> {
    // mover가 아닐 때
    if (userType !== "mover") {
      throw new UnauthorizedException("기사 전용 API입니다.");
    }

    const { page, limit } = paginationDto;
    const safePage = Math.max(page, 1);
    const skip = (safePage - 1) * limit;

    const sentQuotationIdsRaw = await this.receivedQuoteRepository
      .createQueryBuilder("r")
      .select("r.id", "r_id")
      .where("r.moverId = :moverId", { moverId: userId })
      .orderBy("r.createdAt", "DESC")
      .addOrderBy("r.id", "DESC")
      .skip(skip)
      .take(limit)
      .getRawMany();

    const ids = sentQuotationIdsRaw.map((row) => row.r_id);

    // 정렬 보존용 CASE 구문

    if (ids.length === 0) {
      return new PaginatedScrollResponseDto([], 0, safePage, limit);
    }

    // 실제 상세 정보 연결해서 조회
    const sentQuotations = await this.receivedQuoteRepository
      .createQueryBuilder("r")
      .innerJoin("customer", "c", "r.customerId = c.id::text")
      .innerJoin("quotation", "q", "r.quotationId = q.id::text")
      .where("r.id IN (:...ids)", { ids })
      .select([
        `r.id AS "id"`,
        `r.price AS "price"`,
        `r.createdAt AS "createdAt"`,
        `c.username AS "customerNick"`,
        `r.isAssignQuo AS "isAssignQuo"`,
        `q.moveType AS "moveType"`,
        `q.moveDate AS "moveDate"`,
        `q.status AS "status"`,
        `q.startAddress AS "startAddress"`,
        `q.endAddress AS "endAddress"`,
        `CASE WHEN q.confirmedMoverId = :moverId THEN true ELSE false END AS "isConfirmedToMe"`,
      ])
      .setParameter("moverId", userId)
      .orderBy(
        `CASE r.id
          ${ids.map((id, index) => `WHEN '${id}' THEN ${index}`).join("\n")}
          ELSE ${ids.length}
        END`,
      )
      .getRawMany();

    // total 개수 구하기
    const total = await this.receivedQuoteRepository
      .createQueryBuilder("r")
      .where("r.moverId = :moverId", { moverId: userId })
      .getCount();

    const data = sentQuotations.map(
      (row) => new SentQuotationResponseData(row),
    );
    return new PaginatedScrollResponseDto(data, total, safePage, limit);
  }

  async getSentQuotation(
    receivedQuoId: string,
    user: { userId: string; userType: string },
  ): Promise<SentQuotationDetailResponse> {
    const { userId, userType } = user;
    // mover가 아닐 때
    if (userType !== "mover") {
      throw new UnauthorizedException("기사 전용 API입니다.");
    }

    const receivedQuo = await this.receivedQuoteRepository.findOne({
      where: {
        id: receivedQuoId,
      },
    });

    if (receivedQuo?.moverId !== userId) {
      console.log(receivedQuo?.moverId, userId);
      throw new UnauthorizedException("본인이 보낸 견적요청이 아닙니다.");
    }

    if (!receivedQuo) {
      throw new NotFoundException("보낸 견적 내용이 존재하지 않습니다.");
    }

    const customer = await this.customerRepository.findOne({
      where: {
        id: receivedQuo?.customerId,
      },
    });

    if (!customer) {
      throw new NotFoundException(
        "탈퇴했거나 없는 손님에 대한 견적 내용입니다.",
      );
    }

    const quotation = await this.quotationRepository.findOne({
      where: {
        id: receivedQuo.quotationId,
      },
    });

    if (!quotation) {
      throw new NotFoundException(
        "보낸 견적에 대한 quotation이 존재하지 않습니다.",
      );
    }

    return {
      id: receivedQuo.id,
      price: receivedQuo.price,
      customerNick: customer.username,
      isAssignQuo: receivedQuo.isAssignQuo,
      moveType: quotation.moveType,
      status: quotation.status,
      startAddress: quotation.startAddress,
      endAddress: quotation.endAddress,
      moveDate: new Date(quotation.moveDate)
        .toISOString()
        .slice(2, 10)
        .replace(/-/g, "."),
      startQuoDate: receivedQuo.createdAt
        .toISOString()
        .slice(2, 10)
        .replace(/-/g, "."),
      isConfirmedToMe: quotation.confirmedMoverId === userId,
    };
  }
}
