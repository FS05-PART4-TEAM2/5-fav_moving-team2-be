import { RegionKey } from "src/common/constants/region.constant";

export class ReceivedQuotationResponseDto {
  id: string;
  offerMover: {
    id: string;
    username: string;
    likeCount: number;
    totalRating: number;
    reviewCounts: number;
    completedQuotationCount: number;
  };
  quotation: {
    id: string;
    moveType: string;
    moveDate: string;
    startAddress: string;
    endAddress: string;
  };
  price: string;
  isCompleted: boolean;
  isConfirmedMover: boolean;
}
