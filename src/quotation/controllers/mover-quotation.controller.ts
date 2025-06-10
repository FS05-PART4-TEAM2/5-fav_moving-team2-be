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
import { MoverQuotationService } from "../services/mover-quotation.service";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtCookieAuthGuard } from "src/common/guards/jwt-cookie-auth.guard";
import { CommonApiResponse } from "src/common/dto/api-response.dto";
import { QuotationResponseDto } from "../dtos/quotation.response.dto";
import { GetQuotationListRequestDto } from "../dtos/get-quotation-list.request.dto";
import { CreateReceivedQuotationDto } from "../dtos/create-received-quotation.request.dto";
import { ReceivedQuoteResponseDto } from "../dtos/received-quotation.response.dto";
import {
  PaginatedScrollDto,
  PaginatedScrollResponseDto,
} from "src/common/dto/pagination.dto";
import {
  SentQuotationDetailResponse,
  SentQuotationResponseData,
} from "../dtos/get-sent-quotation.response";

@Controller("api/quotation/mover")
export class MoverQuotationController {
  constructor(private readonly moverQuotationService: MoverQuotationService) {}
  /**
   * @TODO GET 받은 요청 목록 조회 API
   * 1. 인증 확인
   * 2. query params
   *   - type: ServiceTypeKey, 이사 유형
   *   - region: RegionKey, 서비스 가능 지역
   *   - isAssigned: boolean, 지정 견적 요청
   *   - username: string, 사용자 이름 검색
   *   - sorted: SortOption, 정렬 옵션
   * 3. request
   *   - moverId
   * 4. response list
   *   - id
   *   - isAssigned
   *   - customer.id
   *   - customer.username
   *   - moveType
   *   - startAddress
   *   - endAddress
   *   - status
   * 5. 무한 스크롤, 페이징 처리 없음 => 요청이 많이 없을 것으로 예상상
   * 6. 이사일이 지난 요청은 조회하지 않음
   */
  @Get("")
  @ApiOperation({ summary: "받은 요청(기사님) 목록 조회" })
  @ApiBearerAuth("access-token")
  @UseGuards(JwtCookieAuthGuard)
  async getReceivedQuotationList(
    @Req() req,
    @Query() queries: GetQuotationListRequestDto,
  ): Promise<CommonApiResponse<QuotationResponseDto[]>> {
    // ): Promise<CommonApiResponse<null>> {
    const { userId, userType } = req.user!;
    const data = await this.moverQuotationService.getReceivedQuotationList(
      { userId, userType },
      queries,
    );

    return CommonApiResponse.success(
      data,
      "받은 요청(기사님) 목록 조회에 성공하였습니다.",
    );
  }

  /**
   * @TODO POST 받은 요청에 견적 보내기 API
   * 1. 인증 확인
   * 2. body
   *   - price: number, 견적가
   *   - comment: string, 코멘트
   *   - isAssignQuo: boolean, 지정 요청 여부
   *   - customerId: string, 고객 id
   *   - quotationId: string, 견적 정보 id
   */
  @Post("")
  @ApiOperation({ summary: "받은 요청(기사님)에 견적 보내기" })
  @ApiBearerAuth("access-token")
  @UseGuards(JwtCookieAuthGuard)
  async createReceivedQuotation(
    @Req() req,
    @Body()
    request: CreateReceivedQuotationDto,
  ): Promise<CommonApiResponse<ReceivedQuoteResponseDto>> {
    const { userId, userType } = req.user!;

    const data = await this.moverQuotationService.createReceivedQuotation(
      { userId, userType },
      request,
    );

    return CommonApiResponse.success(data, "성공적으로 견적을 보냈습니다.");
  }

  /**
   * @TODO POST 받은 요청에 견적 보내기 API
   */

  /**
   *
   */
  @Get("sent")
  @ApiOperation({ summary: "보낸 견적(기사님) 목록 조회" })
  @ApiBearerAuth("access-token")
  @UseGuards(JwtCookieAuthGuard)
  @ApiOkResponse({
    description: "보낸 견적 리스트 조회 성공",
    schema: {
      example: {
        success: true,
        data: {
          list: [
            {
              id: "bd4383a9-f7b2-4de0-a967-94c2a6652da4",
              price: 100000,
              customerNick: "동혁",
              isAssignQuo: true,
              moveType: "SMALL_MOVE",
              status: "PENDING",
              startAddress: "경기 양주",
              endAddress: "경기 수원",
              moveDate: "2025-05-26T00:00:00.000Z",
              createdAt: "2025-06-04T07:50:06.212Z",
            },
            {
              id: "89b054ef-eb00-43b5-8c18-1dbf41a7e75f",
              price: 100000,
              customerNick: "동혁",
              isAssignQuo: true,
              moveType: "SMALL_MOVE",
              status: "PENDING",
              startAddress: "경기 양주",
              endAddress: "경기 수원",
              moveDate: "2025-05-26T00:00:00.000Z",
              createdAt: "2025-06-04T07:46:41.245Z",
            },
          ],
          total: 2,
          page: 1,
          limit: 5,
          hasNextPage: false,
        },
        message: "보낸 견적 리스트 조회 성공",
      },
    },
  })
  async getSentQuotationList(
    @Req() req,
    @Query() paginationDto: PaginatedScrollDto,
  ): Promise<
    CommonApiResponse<PaginatedScrollResponseDto<SentQuotationResponseData>>
  > {
    const { userId, userType } = req.user;
    const result = await this.moverQuotationService.getSentQuotationList(
      userId,
      userType,
      paginationDto,
    );

    return CommonApiResponse.success(result, "보낸 견적 리스트 조회 성공");
  }

  @Get("sent/:id")
  @ApiOperation({ summary: "보낸 견적(기사님) 상세 조회" })
  @ApiParam({
    name: "id",
    description: "기사님이 보낸 견적 ID (receivedQuoId) uuid 형식으로",
    required: true,
  })
  @ApiBearerAuth("access-token")
  @ApiResponse({
    status: 200,
    description: "보낸 견적 상세 조회 성공",
    schema: {
      example: {
        success: true,
        data: {
          id: "bd4383a9-f7b2-4de0-a967-94c2a6652da4",
          price: 100000,
          customerNick: "동혁",
          isAssignQuo: true,
          moveType: "SMALL_MOVE",
          status: "PENDING",
          startAddress: "경기 양주",
          endAddress: "경기 수원",
          moveDate: "25.05.26",
          startQuoDate: "25.06.04",
        },
        message: "보낸 견적 상세 조회 성공",
      },
    },
  })
  @UseGuards(JwtCookieAuthGuard)
  async getSentQuotation(
    @Req() req,
    @Param("id", ParseUUIDPipe) receivedQuoId: string,
  ): Promise<CommonApiResponse<SentQuotationDetailResponse>> {
    const { userId, userType } = req.user!;
    const result = await this.moverQuotationService.getSentQuotation(
      receivedQuoId,
      { userId, userType },
    );

    return CommonApiResponse.success(result, "보낸 견적 상세 조회 성공");
  }
}
