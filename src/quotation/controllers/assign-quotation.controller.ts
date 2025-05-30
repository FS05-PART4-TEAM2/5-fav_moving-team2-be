import {
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { AssignQuotationService } from "../services/assign-quotation.service";
import { JwtCookieAuthGuard } from "src/common/guards/jwt-cookie-auth.guard";
import { CommonApiResponse } from "src/common/dto/api-response.dto";
import { AssignMover } from "../entities/assign-mover.entity";

@ApiTags("AssignMover")
@Controller("api/assignMover")
export class AssignQuotationController {
  constructor(
    private readonly assignQuotationService: AssignQuotationService,
  ) {}

  @Post(":id")
  @ApiOperation({
    summary: "지정 기사 선택",
    description: "지금 현재 내 견적에 지정 기사를 추가합니다.",
  })
  @ApiParam({
    name: "id",
    type: String,
    required: true,
    description: "지정할 기사 ID",
  })
  @UseGuards(JwtCookieAuthGuard)
  async postAssignMover(
    @Req() req,
    @Param("id", ParseUUIDPipe) moverId: string,
  ): Promise<CommonApiResponse<AssignMover>> {
    const { userId, userType } = req.user ?? {};

    const result = await this.assignQuotationService.postAssignMover(
      userId,
      userType,
      moverId,
    );

    return CommonApiResponse.success(result, "지정 기사를 추가했습니다.");
  }
}
