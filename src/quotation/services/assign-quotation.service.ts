import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AssignMover } from "../entities/assign-mover.entity";
import { DataSource, Repository } from "typeorm";
import { Quotation } from "../quotation.entity";
import { InvalidQuotationException } from "src/common/exceptions/invalid-quotation.exception";
import { QUOTATION_STATE_KEY } from "src/common/constants/quotation-state.constant";
import { ASSIGN_STATUS_KEY } from "src/common/constants/assign-status.constant";
import { RejectAssignQuotationRequestDto } from "../dtos/reject-assign-quote.request.dto";
import {
  PaginatedScrollResponseDto,
  PaginationDto,
} from "src/common/dto/pagination.dto";
import { ReceivedQuote } from "../entities/received-quote.entity";
import { Customer } from "src/customer/customer.entity";
import { GetRejectedData } from "../dtos/get-rejected-Data.response.dto";
import { NotificationTextSegment } from "src/notifications/notification.entity";
import { NotificationService } from "src/notifications/notification.service";

@Injectable()
export class AssignQuotationService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(AssignMover)
    private assignMoverRepository: Repository<AssignMover>,
    @InjectRepository(Quotation)
    private quotationRepository: Repository<Quotation>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly notificationService: NotificationService,
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

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const quotation = await queryRunner.manager.findOne(Quotation, {
        where: {
          customerId: userId,
          status: "PENDING",
        },
      });

      if (!quotation) {
        throw new NotFoundException("견적 요청을 먼저 진행해주세요.");
      }

      const isExistsAssign = await queryRunner.manager.exists(AssignMover, {
        where: {
          moverId,
          customerId: userId,
        },
      });

      if (isExistsAssign) {
        throw new BadRequestException("이미 지정한 기사입니다.");
      }

      const prev = quotation.assignMover ?? [];
      const updatedAssignMovers = Array.from(new Set([...prev, moverId]));

      await queryRunner.manager.update(Quotation, quotation.id, {
        assignMover: updatedAssignMovers,
      });

      const newAssignMover = queryRunner.manager.create(AssignMover, {
        moverId,
        quotationId: quotation.id,
        customerId: userId,
        status: "PENDING",
      });

      await queryRunner.manager.save(AssignMover, newAssignMover);

      await queryRunner.commitTransaction();

      // 알림 생성
      const notiSegments: NotificationTextSegment[] = [
        {
          text: `새로운 `,
          isHighlight: false,
        },
        {
          text: `지정 견적 요청`,
          isHighlight: true,
        },
        {
          text: `이 도착했어요`,
          isHighlight: false,
        },
      ];
      await this.notificationService.createNotification(moverId, {
        type: "QUOTE_ARRIVED",
        segments: notiSegments,
      });

      return newAssignMover;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * @TODO quotationId - quotation 유효성 검사
   * @TODO 견적 확정건인지 확인
   * @TODO 이사 완료건인지 확인
   * @TODO assignMover - 지정 견적 요청 유효성 검사
   */
  async rejectAssignQuotation(
    user: { userId: string; userType: string },
    request: RejectAssignQuotationRequestDto,
  ): Promise<void> {
    const { userId, userType } = user;
    const { quotationId, comment } = request;

    // 1. 견적 유효성 검사
    // 2. 견적 확정건인지 확인
    // 3. 이사 완료건인지 확인
    const quotation = await this.quotationRepository.findOne({
      where: {
        id: quotationId,
      },
    });
    if (!quotation || quotation.status !== QUOTATION_STATE_KEY.PENDING)
      throw new InvalidQuotationException("유효하지 않은 견적입니다.");

    // 4. 지정 견적 요청 유효성 검사
    const assignMover = await this.assignMoverRepository.findOne({
      where: {
        moverId: userId,
        quotationId: quotationId,
      },
    });
    if (!assignMover)
      throw new InvalidQuotationException("지정 견적 요청건이 아닙니다.");

    // 5. 반려하기
    await this.assignMoverRepository.update(assignMover, {
      rejectedReason: comment,
      status: ASSIGN_STATUS_KEY.REJECTED,
    });
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

    const rejectedRequestsIdsRaw = await this.assignMoverRepository
      .createQueryBuilder("a")
      .select("a.id", "id")
      .where("a.moverId = :moverId", { moverId: userId })
      .orderBy("a.createdAt")
      .skip(skip)
      .take(limit)
      .getRawMany();

    const ids = rejectedRequestsIdsRaw.map((row) => row.id);

    if (ids.length === 0) {
      return new PaginatedScrollResponseDto([], 0, safePage, limit);
    }

    const rejectedRequests = await this.assignMoverRepository
      .createQueryBuilder("a")
      .innerJoin("customer", "c", "a.customerId = c.id::text")
      .innerJoin("quotation", "q", "a.quotationId = q.id::text")
      .where("a.id IN (:...ids)", { ids })
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
      .getRawMany();

    const total = await this.assignMoverRepository
      .createQueryBuilder("a")
      .where("a.moverId = :moverId", { moverId: userId })
      .getCount();

    const data = rejectedRequests.map((row) => new GetRejectedData(row));
    return new PaginatedScrollResponseDto(data, total, safePage, limit);
  }
}
