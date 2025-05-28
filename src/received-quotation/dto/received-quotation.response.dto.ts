import { RegionKey } from "src/common/constants/region.constant";

export class ReceivedQuotationResponseDto {
  id: string;
  isAssigned: boolean;
  moveType: string;
  offerMover: {
    id: string;
    username: string;
    likeCount: number;
    totalRating: number;
    reviewCounts: number;
    confirmedQuotationCount: number;
  };
  quotation: {
    id: string;
    moveDate: string;
    startAddress: string;
    endAddress: string;
  };
  price: string;
  isCompleted: boolean;
  isConfirmedMover: boolean;
}
