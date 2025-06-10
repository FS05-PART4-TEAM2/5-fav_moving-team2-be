import { Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiQuery } from "@nestjs/swagger";
import { CommonApiResponse } from "src/common/dto/api-response.dto";
import { JwtCookieAuthGuard } from "src/common/guards/jwt-cookie-auth.guard";
import { ReceivedQuotationService } from "../services/customer-quotation.service";
import { ReceivedQuotationResponseDto } from "../dtos/customer-receivedQuotation.response.dto";
import { PaginatedResponseDto } from "src/common/dto/pagination.dto";

@Controller("api/receivedQuo")
export class ReceivedQuotationController {
  constructor(
    private readonly receivedQuotationService: ReceivedQuotationService,
  ) {}
  @Get("customer/pending")
  @ApiOperation({ summary: "일반유저 모든 견적 요청 조회" })
  @UseGuards(JwtCookieAuthGuard)
  async getAllReceivedQuotations(): Promise<
    CommonApiResponse<ReceivedQuotationResponseDto[]>
  > {
    const receivedQuotations =
      await this.receivedQuotationService.getAllPendingReceivedQuotations();
    return CommonApiResponse.success(receivedQuotations, "모든 견적 요청 조회");
  }

  @Post("customer/pending/:receivedQuotationId")
  @ApiOperation({ summary: "견적 확정하기" })
  @UseGuards(JwtCookieAuthGuard)
  async confirmReceivedQuotation(
    @Param("receivedQuotationId") receivedQuotationId: string,
  ): Promise<CommonApiResponse<{ id: string }>> {
    const response =
      await this.receivedQuotationService.confirmReceivedQuotation(
        receivedQuotationId,
      );
    return CommonApiResponse.success(response, "견적 확정 완료");
  }
  @Get("customer/completed")
  @ApiOperation({ summary: "일반유저 모든 완료된 견적 요청 조회" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "페이지 번호 (기본값: 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "페이지당 항목 수 (기본값: 6)",
  })
  @UseGuards(JwtCookieAuthGuard)
  async getAllCompletedReceivedQuotations(
    @Query("page") pageParam: string = "1",
    @Query("limit") limitParam: string = "6",
  ): Promise<
    CommonApiResponse<
      PaginatedResponseDto<ReceivedQuotationResponseDto> & {
        currentPage: number;
        totalPages: number;
      }
    >
  > {
    const page = parseInt(pageParam) || 1;
    const limit = parseInt(limitParam) || 6;

    const result =
      await this.receivedQuotationService.getAllCompletedReceivedQuotations(
        page,
        limit,
      );
    return CommonApiResponse.success(result, "모든 완료된 견적 요청 조회");
  }

  @Get("customer/detail/:receivedQuotationId")
  @ApiOperation({ summary: " 견적 상세보기" })
  @UseGuards(JwtCookieAuthGuard)
  async getCompletedReceivedQuotationDetail(
    @Param("receivedQuotationId") receivedQuotationId: string,
  ): Promise<CommonApiResponse<ReceivedQuotationResponseDto>> {
    const receivedQuotation =
      await this.receivedQuotationService.getReceivedQuotationById(
        receivedQuotationId,
      );
    return CommonApiResponse.success(receivedQuotation, "견적 상세 조회");
  }
}
