// sort-option.constant.ts
export const SortOption = [
  { key: "MOVE_DATE_ASC", label: "이사빠른순" },
  { key: "REQUEST_DATE_ASC", label: "요청일빠른순" },
] as const;

export type SortOptionKey = (typeof SortOption)[number]["key"];
export type SortOptionLabel = (typeof SortOption)[number]["label"];
