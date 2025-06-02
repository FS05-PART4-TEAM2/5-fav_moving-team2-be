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
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { JwtCookieAuthGuard } from "../common/guards/jwt-cookie-auth.guard";
import { CustomerCreateQuotationRequestDto } from "src/common/dto/quotation.request.dto";
import { CommonApiResponse } from "src/common/dto/api-response.dto";
import { Quotation } from "./quotation.entity";
import { PaginatedResponseDto } from "src/common/dto/pagination.dto";

@Controller("api/quotation")
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}

  // 일반유저 견적 요청
  @Post("customer")
  @ApiOperation({ summary: "일반유저 견적 요청" })
  @ApiBearerAuth("access-token")
  @UseGuards(JwtCookieAuthGuard)
  async createCustomerQuotation(
    @Body() createQuotationDto: CustomerCreateQuotationRequestDto,
    @Req() req,
  ): Promise<CommonApiResponse<Quotation | null>> {
    createQuotationDto.customerId = req.user.userId;

    const newQuotation =
      await this.quotationService.createQuotation(createQuotationDto);
    return CommonApiResponse.success(
      newQuotation,
      "견적 요청이 완료되었습니다.",
    );
  }

  @Get("customer")
<<<<<<< HEAD
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "모든 일반유저 견적 요청 조회" })
=======
  @ApiOperation({ summary: "모든 일반유저 견적 조회" })
>>>>>>> 56a5ad0fbfe54fd291e9a5a38c95ca6cc4457d50
  async getAllQuotations(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
  ): Promise<CommonApiResponse<PaginatedResponseDto<Quotation>>> {
    const { data, total } = await this.quotationService.getAllQuotations(
      page,
      limit,
    );
    return CommonApiResponse.success(
      new PaginatedResponseDto(data, total),
      "모든 견적 조회",
    );
  }
}
