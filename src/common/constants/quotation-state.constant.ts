// 1. label 포함된 상태 목록 (UI용)
export const QUOTATION_STATE = [
  { key: "PENDING", label: "대기중" },
  { key: "CONFIRMED", label: "확정됨" },
  { key: "COMPLETED", label: "완료됨" },
  { key: "DELETED", label: "삭제됨" },
] as const;

// 2. 타입 정의 (status 값에 사용)
export type QuotationState = (typeof QUOTATION_STATE)[number]["key"];
export type QuotationStateLabel = (typeof QUOTATION_STATE)[number]["label"];

// 3. enum처럼 쓰기 위한 키 매핑 객체
export const QUOTATION_STATE_KEY = Object.fromEntries(
  QUOTATION_STATE.map(({ key }) => [key, key]),
) as Record<QuotationState, QuotationState>;

// 4. 라벨 매핑 객체 (UI 출력용)
export const QUOTATION_STATE_LABEL_MAP: Record<QuotationState, string> =
  Object.fromEntries(
    QUOTATION_STATE.map(({ key, label }) => [key, label]),
  ) as Record<QuotationState, string>;
