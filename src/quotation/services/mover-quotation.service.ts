import {
  Inject,
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
import { GetQuotationListCountRequestDto } from "../dtos/get-quotation-list-count.request.dto";
import {
  SERVICE_TYPE_LABEL_MAP,
  ServiceTypeKey,
} from "src/common/constants/service-type.constant";
import { QuotationStatisticsDto } from "../dtos/get-quotation-list-count.response.dto";
import { NotificationService } from "src/notifications/notification.service";
import { Mover } from "src/mover/mover.entity";
import { NotificationTextSegment } from "src/notifications/notification.entity";

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
    @InjectRepository(Mover)
    private readonly moverRepository: Repository<Mover>,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * @TODO 반려한 요청 제거
   * @TODO 견적 보낸 요청 제거
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

    // 1. 현재 기사님에게 지정된 요청 조회 (REJECTED 상태 제외)
    const assignMover = await this.assignMoverRepository.find({
      where: {
        moverId: userId,
        status: ASSIGN_STATUS_KEY.PENDING,
      },
    });

    const assignedQuotationIdSet = new Set(
      assignMover.map((a) => a.quotationId),
    );

    // 2. REJECTED 상태인 AssignMover의 quotationId 조회
    const rejectedAssignMover = await this.assignMoverRepository.find({
      where: {
        moverId: userId,
        status: ASSIGN_STATUS_KEY.REJECTED,
      },
      select: ["quotationId"],
    });

    const rejectedQuotationIdSet = new Set(
      rejectedAssignMover.map((a) => a.quotationId),
    );

    // 3. 이미 견적을 보낸 quotationId 조회
    const sentQuotes = await this.receivedQuoteRepository.find({
      where: {
        moverId: userId,
      },
      select: ["quotationId"],
    });

    const sentQuotationIdSet = new Set(sentQuotes.map((q) => q.quotationId));

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
            qb.orWhere(`quotation.startAddress LIKE :region${i}`, {
              [`region${i}`]: `%${label}%`,
            });
            qb.orWhere(`quotation.endAddress LIKE :region${i}`, {
              [`region${i}`]: `%${label}%`,
            });
          });
        }),
      );
    }

    // 4. REJECTED 상태인 견적 제외
    if (rejectedQuotationIdSet.size > 0) {
      qb.andWhere("quotation.id NOT IN (:...rejectedIds)", {
        rejectedIds: Array.from(rejectedQuotationIdSet),
      });
    }

    // 5. 이미 견적을 보낸 견적 제외
    if (sentQuotationIdSet.size > 0) {
      qb.andWhere("quotation.id NOT IN (:...sentIds)", {
        sentIds: Array.from(sentQuotationIdSet),
      });
    }

    // 6. isAssigned 필터링을 데이터베이스 레벨에서 처리
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

    // 7. 정렬 기준 설정
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

    // 8. 커서 기반 필터링
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

    // 9. 여유분을 두고 데이터 조회 (필터링으로 인한 데이터 부족 방지)
    qb.take(limit);

    const quotations = await qb.getMany();

    // 10. 고객 정보 조회 (USERNAME_ASC가 아닐 때도 필요)
    const customerIds = Array.from(
      new Set(quotations.map((q) => q.customerId)),
    );
    const customers = await this.customerRepository.findBy({
      id: In(customerIds),
    });
    const customerMap = new Map(customers.map((c) => [c.id, c]));

    // 11. 응답 생성
    const result = quotations.map((q) =>
      QuotationResponseDto.of(
        q,
        assignedQuotationIdSet.has(q.id),
        customerMap.get(q.customerId),
      ),
    );

    // 12. 다음 커서 생성
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

    const mover = await this.moverRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!mover) throw new InvalidUserException();

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

    // 5. 알림 생성
    const notiSegments: NotificationTextSegment[] = [
      {
        text: `${mover.nickname} 기사님의 `,
        isHighlight: false,
      },
      {
        text: `${SERVICE_TYPE_LABEL_MAP[quotation.moveType]} 견적`,
        isHighlight: true,
      },
      {
        text: `이 도착했어요`,
        isHighlight: false,
      },
    ];
    await this.notificationService.createNotification(customerId, {
      type: "QUOTE_ARRIVED",
      segments: notiSegments,
      receivedQuoteId: newReceivedQuote.id,
    });

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
      moveDate: new Date(quotation.moveDate).toISOString(),
      startQuoDate: receivedQuo.createdAt.toISOString(),
      isConfirmedToMe: quotation.confirmedMoverId === userId,
    };
  }

  /**
   *
   */
  async getReceivedQuotationListCount(
    user: { userId: string; userType: string },
    queries: GetQuotationListCountRequestDto,
  ): Promise<QuotationStatisticsDto> {
    const { userId } = user;
    const { type, region, isAssigned, username } = queries;

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

    // 1. 현재 기사님에게 지정된 요청 조회 (REJECTED 상태 제외)
    const assignMover = await this.assignMoverRepository.find({
      where: {
        moverId: userId,
        status: ASSIGN_STATUS_KEY.PENDING,
      },
    });

    const assignedQuotationIdSet = new Set(
      assignMover.map((a) => a.quotationId),
    );

    // 2. REJECTED 상태인 AssignMover의 quotationId 조회
    const rejectedAssignMover = await this.assignMoverRepository.find({
      where: {
        moverId: userId,
        status: ASSIGN_STATUS_KEY.REJECTED,
      },
      select: ["quotationId"],
    });

    const rejectedQuotationIdSet = new Set(
      rejectedAssignMover.map((a) => a.quotationId),
    );

    // 3. 이미 견적을 보낸 quotationId 조회
    const sentQuotes = await this.receivedQuoteRepository.find({
      where: {
        moverId: userId,
      },
      select: ["quotationId"],
    });

    const sentQuotationIdSet = new Set(sentQuotes.map((q) => q.quotationId));

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
            qb.orWhere(`quotation.startAddress LIKE :region${i}`, {
              [`region${i}`]: `%${label}%`,
            });
            qb.orWhere(`quotation.endAddress LIKE :region${i}`, {
              [`region${i}`]: `%${label}%`,
            });
          });
        }),
      );
    }

    // 4. REJECTED 상태인 견적 제외
    if (rejectedQuotationIdSet.size > 0) {
      qb.andWhere("quotation.id NOT IN (:...rejectedIds)", {
        rejectedIds: Array.from(rejectedQuotationIdSet),
      });
    }

    // 5. 이미 견적을 보낸 견적 제외
    if (sentQuotationIdSet.size > 0) {
      qb.andWhere("quotation.id NOT IN (:...sentIds)", {
        sentIds: Array.from(sentQuotationIdSet),
      });
    }

    // 6. isAssigned 필터링을 데이터베이스 레벨에서 처리
    if (isAssigned !== undefined) {
      if (isAssigned === "true") {
        if (assignedQuotationIdSet.size > 0) {
          qb.andWhere("quotation.id IN (:...assignedIds)", {
            assignedIds: Array.from(assignedQuotationIdSet),
          });
        } else {
          // 지정된 견적이 없으면 빈 통계 반환
          return {
            moveTypeStats: {
              SMALL_MOVE: 0,
              FAMILY_MOVE: 0,
              OFFICE_MOVE: 0,
            },
            startRegionStats: {
              SEOUL: 0,
              BUSAN: 0,
              DAEGU: 0,
              INCHEON: 0,
              GWANGJU: 0,
              DAEJEON: 0,
              ULSAN: 0,
              SEJONG: 0,
              GYEONGGI: 0,
              GANGWON: 0,
              CHUNGBUK: 0,
              CHUNGNAM: 0,
              JEONBUK: 0,
              JEONNAM: 0,
              GYEONGBUK: 0,
              GYEONGNAM: 0,
              JEJU: 0,
            },
            endRegionStats: {
              SEOUL: 0,
              BUSAN: 0,
              DAEGU: 0,
              INCHEON: 0,
              GWANGJU: 0,
              DAEJEON: 0,
              ULSAN: 0,
              SEJONG: 0,
              GYEONGGI: 0,
              GANGWON: 0,
              CHUNGBUK: 0,
              CHUNGNAM: 0,
              JEONBUK: 0,
              JEONNAM: 0,
              GYEONGBUK: 0,
              GYEONGNAM: 0,
              JEJU: 0,
            },
            assignedQuotationCount: 0,
            totalQuotationCount: 0,
          };
        }
      } else {
        if (assignedQuotationIdSet.size > 0) {
          qb.andWhere("quotation.id NOT IN (:...assignedIds)", {
            assignedIds: Array.from(assignedQuotationIdSet),
          });
        }
      }
    }

    // 7. 모든 견적 데이터 조회
    const quotations = await qb.getMany();

    // 8. 통계 데이터 계산
    const moveTypeStats: { [key in ServiceTypeKey]: number } = {
      SMALL_MOVE: 0,
      FAMILY_MOVE: 0,
      OFFICE_MOVE: 0,
    };

    const startRegionStats: { [key in RegionKey]: number } = {
      SEOUL: 0,
      BUSAN: 0,
      DAEGU: 0,
      INCHEON: 0,
      GWANGJU: 0,
      DAEJEON: 0,
      ULSAN: 0,
      SEJONG: 0,
      GYEONGGI: 0,
      GANGWON: 0,
      CHUNGBUK: 0,
      CHUNGNAM: 0,
      JEONBUK: 0,
      JEONNAM: 0,
      GYEONGBUK: 0,
      GYEONGNAM: 0,
      JEJU: 0,
    };

    const endRegionStats: { [key in RegionKey]: number } = {
      SEOUL: 0,
      BUSAN: 0,
      DAEGU: 0,
      INCHEON: 0,
      GWANGJU: 0,
      DAEJEON: 0,
      ULSAN: 0,
      SEJONG: 0,
      GYEONGGI: 0,
      GANGWON: 0,
      CHUNGBUK: 0,
      CHUNGNAM: 0,
      JEONBUK: 0,
      JEONNAM: 0,
      GYEONGBUK: 0,
      GYEONGNAM: 0,
      JEJU: 0,
    };

    quotations.forEach((quotation) => {
      // moveType 통계
      moveTypeStats[quotation.moveType]++;

      // startAddress와 endAddress에서 지역 키 추출
      const startRegionKey = this.getRegionKeyByAddress(quotation.startAddress);
      const endRegionKey = this.getRegionKeyByAddress(quotation.endAddress);

      if (startRegionKey) {
        startRegionStats[startRegionKey]++;
      } else if (endRegionKey) {
        endRegionStats[endRegionKey]++;
      }
    });

    // 9. 지정된 견적 개수 계산
    const assignedQuotationCount = quotations.filter((q) =>
      assignedQuotationIdSet.has(q.id),
    ).length;

    return {
      moveTypeStats,
      startRegionStats,
      endRegionStats,
      assignedQuotationCount,
      totalQuotationCount: quotations.length,
    };
  }

  // 주소에서 지역 키를 추출하는 헬퍼 함수 (utils 파일에 정의하거나 별도로 구현)
  private getRegionKeyByAddress = (address: string): RegionKey | null => {
    const regionMappings = [
      { keys: ["서울"], regionKey: "SEOUL" as RegionKey },
      { keys: ["부산"], regionKey: "BUSAN" as RegionKey },
      { keys: ["대구"], regionKey: "DAEGU" as RegionKey },
      { keys: ["인천"], regionKey: "INCHEON" as RegionKey },
      { keys: ["광주"], regionKey: "GWANGJU" as RegionKey },
      { keys: ["대전"], regionKey: "DAEJEON" as RegionKey },
      { keys: ["울산"], regionKey: "ULSAN" as RegionKey },
      { keys: ["세종"], regionKey: "SEJONG" as RegionKey },
      { keys: ["경기"], regionKey: "GYEONGGI" as RegionKey },
      { keys: ["강원"], regionKey: "GANGWON" as RegionKey },
      { keys: ["충북", "충청북도"], regionKey: "CHUNGBUK" as RegionKey },
      { keys: ["충남", "충청남도"], regionKey: "CHUNGNAM" as RegionKey },
      { keys: ["전북", "전라북도"], regionKey: "JEONBUK" as RegionKey },
      { keys: ["전남", "전라남도"], regionKey: "JEONNAM" as RegionKey },
      { keys: ["경북", "경상북도"], regionKey: "GYEONGBUK" as RegionKey },
      { keys: ["경남", "경상남도"], regionKey: "GYEONGNAM" as RegionKey },
      { keys: ["제주"], regionKey: "JEJU" as RegionKey },
    ];

    for (const mapping of regionMappings) {
      if (mapping.keys.some((key) => address.includes(key))) {
        return mapping.regionKey;
      }
    }

    return null;
  };
}
