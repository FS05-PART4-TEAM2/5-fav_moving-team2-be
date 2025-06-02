// service-type.constant.ts
export const SERVICE_TYPES = [
  { key: "SMALL_MOVE", label: "소형이사" },
  { key: "FAMILY_MOVE", label: "가정이사" },
  { key: "OFFICE_MOVE", label: "사무실이사" },
] as const;

export type ServiceTypeKey = (typeof SERVICE_TYPES)[number]["key"];
export type ServiceTypeLabel = (typeof SERVICE_TYPES)[number]["label"];

// SERVICE_KEYS: class-validator의 IsIn에 사용할 검증용 배열
export const SERVICE_KEYS = SERVICE_TYPES.map((s) => s.key);