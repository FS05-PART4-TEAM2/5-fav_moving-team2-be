import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsInt,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export class CreateMoverReviewDto {
  offerId: string;
  userId: string;

  @ApiProperty({
    description: "리뷰 내용",
    example: "정말 친절하고 빠른 이사 서비스였습니다!",
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100, { message: "리뷰 내용은 100자 이내로 작성해주세요." })
  content: string;

  @ApiProperty({
    description: "평점 (1-5 정수)",
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber({}, { message: "평점은 숫자여야 합니다." })
  @IsInt({ message: "평점은 정수여야 합니다." })
  @Min(1, { message: "평점은 최소 1점입니다." })
  @Max(5, { message: "평점은 최대 5점입니다." })
  @Type(() => Number)
  rating: number;
}
