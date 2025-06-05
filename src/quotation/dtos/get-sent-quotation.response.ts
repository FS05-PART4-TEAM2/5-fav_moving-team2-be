import { QuotationState } from "src/common/constants/quotation-state.constant";
import { ServiceTypeKey } from "src/common/constants/service-type.constant";

export class SentQuotationResponseData {
  id: string;
  price: number;
  customerNick: string; // 고객 이름
  isAssignQuo: boolean; // 지정 견적 요청인지
  moveType: ServiceTypeKey; // 이사 종류
  status: QuotationState; // 견적 상태
  startAddress: string; // 출발 주소
  endAddress: string; // 도착 주소
  moveDate: string;

  constructor(partial: Partial<SentQuotationResponseData>) {
    Object.assign(this, partial);
  }
}