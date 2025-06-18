export const ASSIGN_STATUS = [
  { key: "PENDING", label: "대기중" },
  { key: "REJECTED", label: "거절됨" },
  { key: "APPROVED", label: "승인됨" },
] as const;

export type AssignStatusKey = (typeof ASSIGN_STATUS)[number]["key"];
export type AssignStatusLabel = (typeof ASSIGN_STATUS)[number]["label"];

// 3. enum처럼 쓰기 위한 키 매핑 객체
export const ASSIGN_STATUS_KEY = Object.fromEntries(
  ASSIGN_STATUS.map(({ key }) => [key, key]),
) as Record<AssignStatusKey, AssignStatusKey>;

// 4. 라벨 매핑 객체 (UI 출력용)
export const ASSIGN_STATUS_LABEL_MAP: Record<AssignStatusKey, string> =
  Object.fromEntries(
    ASSIGN_STATUS.map(({ key, label }) => [key, label]),
  ) as Record<AssignStatusKey, string>;
