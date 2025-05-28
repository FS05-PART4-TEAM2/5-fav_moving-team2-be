export class InfiniteScrollResponseDto<T> {
  data: T[];
  
  // 페이지네이션 관련
  orderNextCursor?: number | null;
  idNumNextCursor?: number | null;
  hasNext: boolean;
}