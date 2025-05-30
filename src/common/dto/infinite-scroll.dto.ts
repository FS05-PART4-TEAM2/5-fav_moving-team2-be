export class InfiniteScrollResponseDto<T> {
  list: T[];
  
  // 페이지네이션 관련
  orderNextCursor?: number | null;
  idNumNextCursor?: number | null;
  hasNext: boolean;
}