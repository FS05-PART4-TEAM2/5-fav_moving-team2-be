import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { REGION_KEYS, RegionKey } from "src/common/constants/region.constant";
import {
  SERVICE_KEYS,
  ServiceTypeKey,
} from "src/common/constants/service-type.constant";

export type MoverInfoOrder =
  | "MOSTREVIEW"
  | "BESTRATING"
  | "HIGHESTEXP"
  | "MOSTCONFIRM";

const MOVER_ORDER_KEYS: MoverInfoOrder[] = [
  "MOSTREVIEW",
  "BESTRATING",
  "HIGHESTEXP",
  "MOSTCONFIRM",
];


export class MoverListRequestDto {
  @ApiPropertyOptional({
    description: "지역 코드를 입력하면 됩니다.",
    enum: REGION_KEYS,
  })
  @IsOptional()
  @IsIn(REGION_KEYS, {
    message: "유효하지 않은 지역 코드입니다.",
  })
  region?: RegionKey; // 지역 필터링

  @ApiPropertyOptional({
    description: "서비스 코드를 입력하면 됩니다.",
    enum: SERVICE_KEYS,
  })
  @IsOptional()
  @IsIn(SERVICE_KEYS, {
    message: "유효하지 않은 서비스 코드입니다.",
  })
  service?: ServiceTypeKey; // 서비스 필터링

  @ApiPropertyOptional({
    description: "정렬 순서를 입력하면 됩니다.",
    enum: MOVER_ORDER_KEYS,
  })
  @IsOptional()
  @IsIn(["MOSTREVIEW", "BESTRATING", "HIGHESTEXP", "MOSTCONFIRM"], {
    message: "유효하지 않은 정렬 기준입니다.",
  })
  orderBy?: MoverInfoOrder; // 정렬 순서

  @ApiPropertyOptional({ description: "닉네임 검색 키워드를 입력하면 됩니다." })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description: "idNum 기반 커서 값을 입력하면 됩니다. (숫자)",
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  idNumCursor?: number;

  @ApiPropertyOptional({
    description: "정렬 값 기반 커서 값을 입력하면 됩니다. (숫자)",
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  orderCursor?: number;

  @ApiPropertyOptional({
    description: "한번에 보여줄 데이터 개수 제한 값을 입력하면 됩니다.",
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}