import { QuotationState } from "src/common/constants/quotation-state.constant";
import { ServiceTypeKey } from "src/common/constants/service-type.constant";

export class SentQuotationResponseData {
  id: string;
  price: number; // 견적가
  customerNick: string; // 고객 이름
  isAssignQuo: boolean; // 지정 견적 요청인지
  moveType: ServiceTypeKey; // 이사 종류
  status: QuotationState; // 견적 상태
  startAddress: string; // 출발 주소
  endAddress: string; // 도착 주소
  moveDate: string;
  isConfirmedToMe: boolean; // 확정된 기사가 로그인한 기사님인지

  constructor(partial: Partial<SentQuotationResponseData>) {
    Object.assign(this, partial);
  }
}

export class SentQuotationDetailResponse {
  id: string;
  price: number; // 견적가
  customerNick: string; // 고객 이름
  isAssignQuo: boolean; // 지정 견적 요청인지
  moveType: ServiceTypeKey; // 이사 종류
  status: QuotationState; // 견적 상태
  startAddress: string; // 출발 주소
  endAddress: string; // 도착 주소
  moveDate: string; // 이사 날짜
  startQuoDate: string; // 견적 요청일
  isConfirmedToMe: boolean; // 확정된 기사가 로그인한 기사님인지
}
