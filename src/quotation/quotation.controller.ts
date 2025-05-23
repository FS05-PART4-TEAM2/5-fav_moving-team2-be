import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
  Get,
  Query,
} from "@nestjs/common";
import { QuotationService } from "./quotation.service";
import { ApiOperation } from "@nestjs/swagger";
import { JwtCookieAuthGuard } from "../common/guards/jwt-cookie-auth.guard";
import { CustomerCreateQuotationRequestDto } from "src/common/dto/quotation.request.dto";
import { ApiResponse } from "src/common/dto/api-response.dto";
import { Quotation } from "./quotation.entity";
import {
  PaginatedResponseDto,
  PaginationDto,
} from "src/common/dto/pagination.dto";

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

  @Get("customer")
  @ApiOperation({ summary: "모든 일반유저 견적 요청 조회" })
  async getAllQuotations(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
  ): Promise<ApiResponse<PaginatedResponseDto<Quotation>>> {
    const { data, total } = await this.quotationService.getAllQuotations(
      page,
      limit,
    );
    return ApiResponse.success(
      new PaginatedResponseDto(data, total),
      "모든 견적 요청 조회",
    );
  }
}
