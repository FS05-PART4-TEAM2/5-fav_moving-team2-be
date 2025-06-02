import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";
import { MoverReview } from "src/moverReview/moverReview.entity";

export class PaginationDto {
  page: number;
  limit: number;

  constructor(page: number, limit: number) {
    this.page = page;
    this.limit = limit;
  }
}

export class PaginatedResponseDto<T> {
  data: T[];
  total: number;

  constructor(data: T[], total: number) {
    this.data = data;
    this.total = total;
  }
}

export class ReviewPaginationRequestDto {
  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page: number;

  @ApiPropertyOptional({ default: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number;
}

export class ReviewPaginationResponseDto {
  list: MoverReview[];
  totalPages: number;
  currentPage: number;
  ratingCounts: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  }
}
