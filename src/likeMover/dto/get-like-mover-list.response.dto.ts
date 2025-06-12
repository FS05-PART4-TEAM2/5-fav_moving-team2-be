import { ServiceTypeKey } from "src/common/constants/service-type.constant";

export class GetLikeMoverData {
  id: string;
  idNum: number;
  nickName: string;
  profileImage: string | null;
  serviceList: ServiceTypeKey[] | null;
  isAssigned: boolean;
  isLiked: boolean;
  likeCount: number;
  totalRating: number;
  reviewCounts: number;
  intro: string;
  career: number;
  confirmedCounts: number;
}
