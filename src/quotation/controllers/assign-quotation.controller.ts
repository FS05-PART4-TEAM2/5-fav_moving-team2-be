import {
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AssignQuotationService } from "../services/assign-quotation.service";
import { JwtCookieAuthGuard } from "src/common/guards/jwt-cookie-auth.guard";
import { CommonApiResponse } from "src/common/dto/api-response.dto";
import { AssignMover } from "../entities/assign-mover.entity";

@ApiTags("AssignMover")
@ApiBearerAuth("access-token")
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
  @ApiResponse({
    status: 201,
    description: "지정 기사 요청 성공",
    schema: {
      type: "object",
      example: {
        success: true,
        data: {
          id: "966f32ec-04ec-41d3-8d23-a1ec6d5a1f96",
          status: "PENDING",
          rejectedReason: null,
          moverId: "1503b09e-41a3-48f7-af15-7643e8c1a38d",
          customerId: "39d35584-a217-4f35-9575-f6ee81a9180b",
          quotationId: "08a625e2-29a9-42e7-8b28-7f6174386915",
          createdAt: "2025-05-31T15:34:04.404Z",
          updatedAt: "2025-05-31T15:34:04.404Z",
        },
        message: "지정 기사를 추가했습니다.",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "이미 지정한 기사일 때",
    schema: {
      example: {
        success: false,
        message: "이미 지정한 기사입니다.",
        errorCode: "BadRequestException",
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "기사 계정으로 로그인 했을 때",
    schema: {
      example: {
        success: false,
        data: null,
        message: "기사 계정으로는 지정 기사 요청을 할 수 없습니다.",
        errorCode: "UnauthorizedException",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "아직 견적 요청을 하지 않았을 때",
    schema: {
      example: {
        success: false,
        data: null,
        message: "견적 요청을 먼저 진행해주세요.",
        errorCode: "NotFoundException",
      },
    },
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
