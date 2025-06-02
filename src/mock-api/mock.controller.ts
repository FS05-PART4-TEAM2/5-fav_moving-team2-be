import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import {
  receivedQuotationListMock,
  receivedQuotationDetailMock,
  receivedQuotationCompletedListMock,
} from "./mock/received-quotation.mock";
import { CommonApiResponse } from "src/common/dto/api-response.dto";
import { JwtCookieAuthGuard } from "src/common/guards/jwt-cookie-auth.guard";

@Controller("api/receivedQuo")
export class ReceivedQuotationMockController {
  // 전체 목록 mock
  @Get("customer/pending/mock")
  @UseGuards(JwtCookieAuthGuard)
  getMockList() {
    return CommonApiResponse.success(
      receivedQuotationListMock,
      "mock 견적 목록",
    );
  }

  // 상세 mock (id 무시, 항상 같은 데이터 반환)
  @Get("customer/pending/mock/:receivedQuotationId")
  getMockDetail(@Param("receivedQuotationId") receivedQuotationId: string) {
    return CommonApiResponse.success(
      receivedQuotationDetailMock,
      "mock 견적 상세",
    );
  }

  @Get("customer/completed/mock")
  @UseGuards(JwtCookieAuthGuard)
  getMockCompletedList() {
    return CommonApiResponse.success(
      receivedQuotationCompletedListMock,
      "mock 완료된 견적 목록",
    );
  }

  @Get("customer/completed/mock/:receivedQuotationId")
  @UseGuards(JwtCookieAuthGuard)
  getMockCompletedDetail(
    @Param("receivedQuotationId") receivedQuotationId: string,
  ) {
    return CommonApiResponse.success(
      receivedQuotationDetailMock,
      "mock 완료된 견적 상세",
    );
  }
}
