export const QUOTATION_STATE = [
  { key: "PENDING", label: "대기중" },
  { key: "CONFIRMED", label: "확정됨" },
  { key: "COMPLETED", label: "완료됨" },
  { key: "DELETED", label: "삭제됨" },
] as const;

export type QuotationState = (typeof QUOTATION_STATE)[number]["key"];
export type QuotationStateLabel = (typeof QUOTATION_STATE)[number]["label"];
