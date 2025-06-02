import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoverReview } from "./moverReview.entity";
import { Repository } from "typeorm";
import { ReviewPaginationResponseDto } from "src/common/dto/pagination.dto";

@Injectable()
export class MoverReviewService {
  constructor(
    @InjectRepository(MoverReview)
    private moverReviewRepository: Repository<MoverReview>,
  ) {}

  async getMoverReviewList(
    userId: string,
    userType: string,
    moverId: string,
    page: number = 0,
    limit: number = 5,
  ): Promise<ReviewPaginationResponseDto> {
    const [reviews, total] = await this.moverReviewRepository.findAndCount({
      where: { moverId },
      order: { createdAt: "DESC" },
      skip: page * limit,
      take: limit,
    });

    // 별점 분포 조회
    const ratingCountsRaw = await this.moverReviewRepository
      .createQueryBuilder("review")
      .select("review.rating", "rating")
      .addSelect("COUNT(*)", "count")
      .where("review.moverId = :moverId", { moverId })
      .groupBy("review.rating")
      .getRawMany();

    // 1~5점 모두 포함한 형태로 변환 작업
    const ratingCounts: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    } = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    for (const row of ratingCountsRaw) {
      ratingCounts[row.rating] = Number(row.count);
    }

    return {
      totalPages: Math.ceil(total / limit),
      list: reviews,
      currentPage: page,
      ratingCounts,
    };
  }
}
