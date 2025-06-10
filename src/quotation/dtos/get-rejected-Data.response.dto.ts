import { ServiceTypeKey } from "src/common/constants/service-type.constant";

export class GetRejectedData {
  id: string;
  customerNick: string;
  moveType: ServiceTypeKey;
  startAddress: string;
  endAddress: string;
  moveDate: string;

  constructor(partial: Partial<GetRejectedData>) {
    Object.assign(this, partial);
  }
}
