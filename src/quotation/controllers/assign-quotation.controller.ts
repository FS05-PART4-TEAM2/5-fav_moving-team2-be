import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AssignQuotationService } from "../services/assign-quotation.service";
import { JwtCookieAuthGuard } from "src/common/guards/jwt-cookie-auth.guard";
import { CommonApiResponse } from "src/common/dto/api-response.dto";
import { AssignMover } from "../entities/assign-mover.entity";
import { RejectAssignQuotationRequestDto } from "../dtos/reject-assign-quote.request.dto";
import {
  PaginatedScrollDto,
  PaginatedScrollResponseDto,
} from "src/common/dto/pagination.dto";
import { GetRejectedData } from "../dtos/get-rejected-Data.response.dto";

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

  /**
   * @TODO POST 받은 요청 반려하기 API
   * 1. 인증 확인
   * 2. body
   *   - quotationId: string, 견적 정보 id
   *   - comment: string, 반려 사유
   */
  @Put("")
  @ApiOperation({ summary: "받은 요청(기사님) 반려하기" })
  @ApiBearerAuth("access-token")
  @UseGuards(JwtCookieAuthGuard)
  async rejectAssignQuotation(
    @Req() req,
    @Body()
    request: RejectAssignQuotationRequestDto,
  ): Promise<CommonApiResponse<null>> {
    const { userId, userType } = req.user;

    await this.assignQuotationService.rejectAssignQuotation(
      { userId, userType },
      request,
    );

    return CommonApiResponse.success(null, "지정 견적 요청을 반려하였습니다.");
  }

  @Get("reject")
  @ApiOperation({
    summary: "기사 - 반려 요청 리스트 보기",
    description: "기사가 거절했던 요청들의 리스트를 볼 수 있습니다.",
  })
  @ApiBearerAuth("access-token")
  @UseGuards(JwtCookieAuthGuard)
  @ApiOkResponse({
    description: "반려 요청 리스트 조회 성공",
    schema: {
      example: {
        success: true,
        data: {
          list: [
            {
              id: "90ee430e-9d82-4b45-b3c7-bb49c254c2bf",
              customerNick: "동혁",
              moveType: "SMALL_MOVE",
              startAddress: "경기 양주",
              endAddress: "경기 수원",
              moveDate: "2025-05-26T00:00:00.000Z",
            },
          ],
          total: 1,
          page: 1,
          limit: 8,
          hasNextPage: false,
        },
        message: "반려 요청 리스트 조회에 성공했습니다.",
      },
    },
  })
  async getRejectRequestList(
    @Req() req,
    @Query() paginationDto: PaginatedScrollDto,
  ): Promise<CommonApiResponse<PaginatedScrollResponseDto<GetRejectedData>>> {
    const { userId, userType } = req.user!;
    const result = await this.assignQuotationService.getRejectRequestList(
      userId,
      userType,
      paginationDto,
    );

    return CommonApiResponse.success(
      result,
      "반려 요청 리스트 조회에 성공했습니다.",
    );
  }
}
