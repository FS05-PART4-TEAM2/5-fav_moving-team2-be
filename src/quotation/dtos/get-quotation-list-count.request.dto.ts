import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class GetQuotationListCountRequestDto {
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
}
