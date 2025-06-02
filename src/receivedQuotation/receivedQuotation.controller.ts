import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ReceivedQuotationService } from "./receivedQuotation.service";
import { ApiOperation } from "@nestjs/swagger";
import { CommonApiResponse } from "src/common/dto/api-response.dto";
import { ReceivedQuotationResponseDto } from "./dto/receivedQuotation.response.dto";
import { JwtCookieAuthGuard } from "src/common/guards/jwt-cookie-auth.guard";

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
  @UseGuards(JwtCookieAuthGuard)
  async getAllCompletedReceivedQuotations(): Promise<
    CommonApiResponse<ReceivedQuotationResponseDto[]>
  > {
    const receivedQuotations =
      await this.receivedQuotationService.getAllCompletedReceivedQuotations();
    return CommonApiResponse.success(
      receivedQuotations,
      "모든 완료된 견적 요청 조회",
    );
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
