import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsString } from "class-validator";
import { Type } from "class-transformer";

export class CreateReceivedQuotationDto {
  @ApiProperty({ description: "견적가", example: 100000 })
  @Type(() => Number)
  @IsNumber()
  price: number;

  @ApiProperty({ description: "코멘트", example: "따로 연락드리겠습니다." })
  @IsString()
  comment: string;

  @ApiProperty({ description: "지정 요청 여부", example: true })
  @IsBoolean()
  isAssignQuo: boolean;

  @ApiProperty({
    description: "고객 id",
    example: "2e50b8a4-1234-5678-aaaa-bbcccdddeeff",
  })
  @IsString()
  customerId: string;

  @ApiProperty({
    description: "견적 정보 id",
    example: "78abf3c2-5678-1234-abcd-ef9876543210",
  })
  @IsString()
  quotationId: string;
}
