export class InfiniteScrollResponseDto<T> {
  data: T[];
  
  // 페이지네이션 관련
  nextCursor: number | null;
  hasNext: boolean;
}