import { Body, Controller, Post, UseGuards, Req } from "@nestjs/common";
import { QuotationService } from "./quotation.service";
import { ApiOperation } from "@nestjs/swagger";
import { JwtCookieAuthGuard } from "../common/guards/jwt-cookie-auth.guard";
import { CustomerCreateQuotationRequestDto } from "src/common/dto/quotation.requst.dto";
import { ApiResponse } from "src/common/dto/api-response.dto";
import { Quotation } from "./quotation.entity";

@Controller("api/quotation")
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}

  // 일반유저 견적 요청
  @Post("customer")
  @ApiOperation({ summary: "일반유저 견적 요청" })
  @UseGuards(JwtCookieAuthGuard)
  async createCustomerQuotation(
    @Body() createQuotationDto: CustomerCreateQuotationRequestDto,
    @Req() req,
  ): Promise<ApiResponse<Quotation | null>> {
    createQuotationDto.customerId = req.user.userId;

    const newQuotation =
      await this.quotationService.createQuotation(createQuotationDto);
    return ApiResponse.success(newQuotation, "견적 요청이 완료되었습니다.");
  }
}
