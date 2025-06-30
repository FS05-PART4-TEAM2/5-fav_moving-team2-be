import { ServiceTypeKey } from "src/common/constants/service-type.constant";

export class FindMoverData {
  id: string;
  idNum: number;
  nickname: string;
  isLiked: boolean; // 찜한 기사님인지 여부
  isAssigned: boolean; // 지정 기사인지 여부
  profileImage: string | null; // 프로필 이미지
  career: number;
  intro: string;
  confirmedCounts: number; // 확정 견적 개수
  reviewCounts: number;
  likeCount: number;
  totalRating: number;
  serviceList: ServiceTypeKey[];
  avgRating?: number;
}
