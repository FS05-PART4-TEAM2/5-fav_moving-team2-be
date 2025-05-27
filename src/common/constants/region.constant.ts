// region.constant.ts
export const REGIONS = [
  { key: "SEOUL", label: "서울" },
  { key: "GYEONGGI", label: "경기" },
  { key: "INCHEON", label: "인천" },
  { key: "GANGWON", label: "강원" },
  { key: "CHUNGBUK", label: "충북" },
  { key: "CHUNGNAM", label: "충남" },
  { key: "SEJONG", label: "세종" },
  { key: "DAEJEON", label: "대전" },
  { key: "JEONBUK", label: "전북" },
  { key: "JEONNAM", label: "전남" },
  { key: "GWANGJU", label: "광주" },
  { key: "GYEONGBUK", label: "경북" },
  { key: "GYEONGNAM", label: "경남" },
  { key: "DAEGU", label: "대구" },
  { key: "ULSAN", label: "울산" },
  { key: "BUSAN", label: "부산" },
  { key: "JEJU", label: "제주" },
] as const;

export type RegionKey = (typeof REGIONS)[number]["key"];
export type RegionLabel = (typeof REGIONS)[number]["label"];

// REGION_KEYS: class-validator의 IsIn에 사용할 검증용 배열
export const REGION_KEYS = REGIONS.map((r) => r.key);
