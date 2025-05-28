import { Controller, Get, UseGuards } from "@nestjs/common";
import { ReceivedQuotationService } from "./received-quotation.service";
import { ApiOperation } from "@nestjs/swagger";
import { CommonApiResponse } from "src/common/dto/api-response.dto";
import { ReceivedQuotationResponseDto } from "./dto/received-quotation.response.dto";
import { JwtCookieAuthGuard } from "src/common/guards/jwt-cookie-auth.guard";

@Controller("api/receivedQuo")
export class ReceivedQuotationController {
  constructor(
    private readonly receivedQuotationService: ReceivedQuotationService,
  ) {}
  @Get("customer")
  @ApiOperation({ summary: "일반유저 모든 견적 요청 조회" })
  @UseGuards(JwtCookieAuthGuard)
  async getAllReceivedQuotations(): Promise<
    CommonApiResponse<ReceivedQuotationResponseDto[]>
  > {
    const receivedQuotations =
      await this.receivedQuotationService.getAllReceivedQuotations();
    return CommonApiResponse.success(receivedQuotations, "모든 견적 요청 조회");
  }
}
