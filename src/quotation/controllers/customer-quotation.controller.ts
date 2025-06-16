import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
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
  async getAllReceivedQuotations(
    @Req() req,
  ): Promise<CommonApiResponse<ReceivedQuotationResponseDto[]>> {
    const receivedQuotations =
      await this.receivedQuotationService.getAllPendingReceivedQuotations(
        req.user.id,
      );
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
  @UseGuards(JwtCookieAuthGuard)
  async getAllCompletedReceivedQuotations(
    @Req() req,
  ): Promise<CommonApiResponse<ReceivedQuotationResponseDto[]>> {
    const result =
      await this.receivedQuotationService.getAllCompletedReceivedQuotations(
        req.user.id,
      );
    return CommonApiResponse.success(result, "모든 완료된 견적 요청 조회");
  }
  @Get("customer/detail/:receivedQuotationId")
  @ApiOperation({ summary: " 견적 상세보기" })
  @UseGuards(JwtCookieAuthGuard)
  async getCompletedReceivedQuotationDetail(
    @Req() req,
    @Param("receivedQuotationId") receivedQuotationId: string,
  ): Promise<CommonApiResponse<ReceivedQuotationResponseDto>> {
    const receivedQuotation =
      await this.receivedQuotationService.getReceivedQuotationById(
        req.user.id,
        receivedQuotationId,
      );
    return CommonApiResponse.success(receivedQuotation, "견적 상세 조회");
  }
}
