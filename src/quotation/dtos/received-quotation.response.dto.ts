import { QuotationState } from "src/common/constants/quotation-state.constant";
import { ServiceTypeKey } from "src/common/constants/service-type.constant";
import { Quotation } from "../quotation.entity";
import { Customer } from "src/customer/customer.entity";

export class ReceivedQuotationResponseDto {
  id: string;
  moveType: ServiceTypeKey;
  isAssigned: boolean;
  customer: {
    id: string;
    username: string;
  };
  startAddress: string;
  endAddress: string;
  status: QuotationState;
  moveDate: string;

  static of(
    q: Quotation,
    isAssigned: boolean,
    customer?: Customer,
  ): ReceivedQuotationResponseDto {
    const dto = new ReceivedQuotationResponseDto();

    dto.id = q.id;
    dto.moveType = q.moveType; // 보통 단일값이라면 [q.moveType]로 래핑 필요 없음
    dto.isAssigned = isAssigned;
    dto.startAddress = q.startAddress;
    dto.endAddress = q.endAddress;
    dto.status = q.status;
    dto.moveDate = q.moveDate;

    dto.customer = {
      id: customer?.id ?? q.customerId,
      username: customer?.username ?? "", // username은 Customer가 필요
    };

    return dto;
  }
}
