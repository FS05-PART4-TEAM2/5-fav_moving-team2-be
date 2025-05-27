export class MoverListResponseDto {
  moverList: FindMoverData[];
  
  // 페이지네이션 관련
  nextCursor?: string;
  hasNext: boolean;
}

export class FindMoverData {
  id: string;
  nickname: string;
  isProfile: boolean;
  isLiked: boolean;   // 찜한 기사님인지 여부
  isAssigned: boolean; // 지정 기사인지 여부
  career: string;
  intro: string;
  confirmedCounts: number; // 확정 견적 개수
  reviewCounts: number;
  likeCount: number;
}