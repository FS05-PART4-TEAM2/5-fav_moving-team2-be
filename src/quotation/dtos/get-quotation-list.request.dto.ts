import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

/**
 *   - type: ServiceTypeKey, 이사 유형
 *   - region: RegionKey, 서비스 가능 지역
 *   - isAssigned: boolean, 지정 견적 요청
 *   - username: string, 사용자 이름 검색
 *   - sorted: SortOption, 정렬 옵션
 */
export class GetQuotationListRequestDto {
  @ApiProperty({
    description: "이사 유형",
    example: "SMALL_MOVE,FAMILY_MOVE,OFFICE_MOVE",
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    description: "서비스 가능 지역",
    example:
      "SEOUL,GYEONGGI,INCHEON,GANGWON,CHUNGBUK,CHUNGNAM,SEJONG,DAEJEON,JEONBUK,JEONNAM,GWANGJU,GYEONGBUK,GYEONGNAM,DAEGU,ULSAN,BUSAN,JEJU",
  })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiProperty({
    description: "지정 견적 요청",
    example: "true | false",
  })
  @IsString()
  @IsOptional()
  isAssigned?: string;

  @ApiProperty({
    description: "사용자 이름 검색",
    example: "홍길동",
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: "정렬 옵션",
    example: "MOVE_DATE_ASC | REQUEST_DATE_ASC",
  })
  @IsString()
  @IsOptional()
  sorted?: string;

  @ApiProperty({
    description: "커서 기준 ID",
    example: "uuid",
    required: false,
  })
  @IsString()
  @IsOptional()
  cursorId?: string;

  @ApiProperty({
    description: "커서 기준 날짜",
    example: "2025-06-10T12:00:00Z",
    required: false,
  })
  @IsString()
  @IsOptional()
  cursorDate?: string;

  @ApiProperty({
    description: "가져올 데이터 수",
    example: "10",
    required: false,
  })
  @IsString()
  @IsOptional()
  take?: string;
}
