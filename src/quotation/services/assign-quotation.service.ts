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
      }
    })

    if(isExistsAssign){
      throw new BadRequestException("이미 지정한 기사입니다.")
    }

    // 찾은 quotationId, moverId 바탕으로 assignMover 생성
    const newAssignMover = this.assignMoverRepository.create({
      moverId,
      quotationId: quotation?.id,
      customerId: userId,
      status: "PENDING",
      rejectedReason: "",
    });

    await this.assignMoverRepository.save(newAssignMover);

    return newAssignMover;
  }
}
