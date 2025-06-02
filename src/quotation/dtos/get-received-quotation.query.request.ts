// src/quotation/dto/get-received-quotation.dto.ts

import { ApiProperty } from "@nestjs/swagger";
import { ServiceTypeKey } from "src/common/constants/service-type.constant";
import { RegionKey } from "src/common/constants/region.constant";
import { SortOption } from "../types/sort-option.type";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from "class-validator";
import { Transform, Type } from "class-transformer";

export class GetReceivedQuotationQueryDto {
  @ApiProperty({
    description: "이사 유형",
    enum: ["SMALL_MOVE", "FAMILY_MOVE", "OFFICE_MOVE"],
    isArray: true,
    example: ["SMALL_MOVE", "FAMILY_MOVE"],
  })
  @IsArray()
  @IsEnum(["SMALL_MOVE", "FAMILY_MOVE", "OFFICE_MOVE"], { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @Type(() => String)
  type: ServiceTypeKey[];

  @ApiProperty({
    description: "서비스 가능 지역",
    enum: [
      "SEOUL",
      "GYEONGGI",
      "INCHEON",
      "GANGWON",
      "CHUNGBUK",
      "CHUNGNAM",
      "SEJONG",
      "DAEJEON",
      "JEONBUK",
      "JEONNAM",
      "GWANGJU",
      "GYEONGBUK",
      "GYEONGNAM",
      "DAEGU",
      "ULSAN",
      "BUSAN",
      "JEJU",
    ],
    isArray: true,
    example: ["SEOUL", "BUSAN"],
  })
  @IsArray()
  @IsEnum(
    [
      "SEOUL",
      "GYEONGGI",
      "INCHEON",
      "GANGWON",
      "CHUNGBUK",
      "CHUNGNAM",
      "SEJONG",
      "DAEJEON",
      "JEONBUK",
      "JEONNAM",
      "GWANGJU",
      "GYEONGBUK",
      "GYEONGNAM",
      "DAEGU",
      "ULSAN",
      "BUSAN",
      "JEJU",
    ],
    { each: true },
  )
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @Type(() => String)
  region: RegionKey[];

  @ApiProperty({
    description: "지정 견적 요청",
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isAssigned?: boolean;

  @ApiProperty({
    description: "사용자 이름 검색",
    required: false,
    example: "홍길동",
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    description: "정렬 옵션",
    enum: ["moveDateAsc", "createdAtAsc"],
    required: false,
    example: "moveDateAsc",
  })
  @IsOptional()
  @IsEnum(["moveDateAsc", "createdAtAsc"])
  sorted?: SortOption;
}
