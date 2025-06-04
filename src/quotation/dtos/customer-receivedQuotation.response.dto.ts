import { ServiceTypeKey } from "src/common/constants/service-type.constant";

// export class ReceivedQuotationResponseDto {
//   id: string;
//   isAssigned: boolean;
//   moveType: string;
//   offerMover: {
//     id: string;
//     profileImageUrl: string;
//     nickname: string;
//     likeCount: number;
//     totalRating: number;
//     intro: string;
//     career: number;
//     isLiked: boolean;
//     reviewCounts: number;
//     confirmedQuotationCount: number;
//   };
//   quotation: {
//     id: string;
//     createdAt: string;
//     moveDate: string;
//     startAddress: string;
//     endAddress: string;
//   };
//   price: string;
//   isCompleted: boolean;
//   isConfirmedMover: boolean;
// }

export interface OfferDto {
  offerId: string;
  moverId: string;
  moverNickname: string;
  moverProfileImageUrl: string;
  isAssigned: boolean;
  price: string;
  likeCount: number;
  totalRating: number;
  reviewCounts: number;
  intro: string;
  career: number;
  isLiked: boolean;
  confirmedQuotationCount: number;
  isCompleted: boolean;
  isConfirmedMover: boolean;
}

export class ReceivedQuotationResponseDto {
  quotationId: string;
  requestedAt: string;
  moveType: ServiceTypeKey;
  moveDate: string;
  startAddress: string;
  endAddress: string;
  offers: OfferDto[];
}
