import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class RejectAssignQuotationRequestDto {
  @ApiProperty({
    description: "견적 정보 id",
    example: "uuid",
    required: true,
  })
  @IsString()
  quotationId: string;

  @ApiProperty({
    description: "반려 사유",
    example: "가기 싫어요",
    required: true,
  })
  @IsString()
  comment: string;
}
