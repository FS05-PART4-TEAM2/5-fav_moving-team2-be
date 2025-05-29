import { RegionKey } from "src/common/constants/region.constant";
import { ServiceTypeKey } from "src/common/constants/service-type.constant";

export class ReceivedQuotationResponseDto {
  id: string;
  isAssigned: boolean;
  moveType: string;
  offerMover: {
    id: string;
    profileImageUrl: string;
    nickname: string;
    likeCount: number;
    totalRating: number;
    intro: string;
    career: number;
    isLiked: boolean;
    reviewCounts: number;
    confirmedQuotationCount: number;
  };
  quotation: {
    id: string;
    createdAt: string;
    moveDate: string;
    startAddress: string;
    endAddress: string;
  };
  price: string;
  isCompleted: boolean;
  isConfirmedMover: boolean;
}
