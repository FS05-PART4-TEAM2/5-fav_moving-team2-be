import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString } from "class-validator";

export class NotificationRequestDto {
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

  @ApiPropertyOptional({ description: "한 번에 조회할 개수", example: 10 })
  @IsOptional()
  @IsNumberString()
  limit?: number;
}
