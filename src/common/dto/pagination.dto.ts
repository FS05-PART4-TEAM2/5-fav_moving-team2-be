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
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 6 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 6;
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
  };
  ratingPercentages: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  totalRating: number; // 기사의 별점 평균 점수 - 추후 리뷰 작성 API에서 계산 로직 구현해야해서 현재는 계산 X
}

export class CustomerReviewPaginationResponseDto {
  list: {
    content: string;
    rating: number;
    reviewDate: Date | null;
    moverName: string;
    moverProfileImage?: string | null;
    moveDate: string;
    startAddress: string;
    endAddress: string;
    moveType: string;
    price: string;
    isAssignedMover: boolean;
    offerId?: string; // 작성 가능한 리뷰 조회 시 필요
  }[];
  totalPages: number;
  totalCount: number;
  currentPage: number;
}
