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
import { InvalidQuotationException } from "src/common/exceptions/invalid-quotation.exception";
import { QUOTATION_STATE_KEY } from "src/common/constants/quotation-state.constant";
import { ASSIGN_STATUS_KEY } from "src/common/constants/assign-status.constant";

@Injectable()
export class AssignQuotationService {
  constructor(
    @InjectRepository(AssignMover)
    private assignMoverRepository: Repository<AssignMover>,
    @InjectRepository(Quotation)
    private quotationRepository: Repository<Quotation>,
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

  /**
   * @TODO quotationId - quotation 유효성 검사
   * @TODO 견적 확정건인지 확인
   * @TODO 이사 완료건인지 확인
   * @TODO assignMover - 지정 견적 요청 유효성 검사
   */
  async rejectAssignQuotation(
    user: { userId: string; userType: string },
    request: {
      quotationId: string;
      comment: string;
    },
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
}
