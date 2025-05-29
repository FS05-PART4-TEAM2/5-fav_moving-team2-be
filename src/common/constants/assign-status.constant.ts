export const ASSIGN_STATUS = [
  { key: "PENDING", label: "대기중" },
  { key: "REJECTED", label: "거절됨" },
  { key: "APPROVED", label: "승인됨" },
] as const;

export type AssignStatusKey = (typeof ASSIGN_STATUS)[number]["key"];
export type AssignStatusLabel = (typeof ASSIGN_STATUS)[number]["label"];
