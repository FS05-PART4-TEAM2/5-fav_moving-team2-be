import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { MoverQuotationService } from "../services/mover-quotation.service";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { JwtCookieAuthGuard } from "src/common/guards/jwt-cookie-auth.guard";
import { CommonApiResponse } from "src/common/dto/api-response.dto";
import { QuotationResponseDto } from "../dtos/quotation.response.dto";
import { GetQuotationListRequestDto } from "../dtos/get-quotation-list.request.dto";
import { CreateReceivedQuotationDto } from "../dtos/create-received-quotation.request.dto";
import { ReceivedQuoteResponseDto } from "../dtos/received-quotation.response.dto";

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
}
