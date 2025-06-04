import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoverReview } from "./moverReview.entity";
import { Repository } from "typeorm";
import { ReviewPaginationResponseDto } from "src/common/dto/pagination.dto";
import { faker } from "@faker-js/faker";
import { Mover } from "src/mover/mover.entity";

@Injectable()
export class MoverReviewService {
  constructor(
    @InjectRepository(MoverReview)
    private moverReviewRepository: Repository<MoverReview>,
    @InjectRepository(Mover)
    private moverRepository: Repository<Mover>,
  ) {}

  async getMoverReviewList(
    userId: string,
    userType: string,
    moverId: string,
    page: number = 1,
    limit: number = 5,
  ): Promise<ReviewPaginationResponseDto> {
    const safePage = Math.max(1, page);
    const [reviews, total] = await this.moverReviewRepository.findAndCount({
      where: { moverId },
      skip: (safePage - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    });

    const totalRating = await this.moverRepository
      .createQueryBuilder("mover")
      .select("mover.totalRating", "totalRating")
      .where("mover.id = :moverId", { moverId })
      .getRawOne()
      .then((res) => res?.totalRating ?? 0);

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

    const ratingPercentages: {
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

    const totalCount = Object.values(ratingCounts).reduce(
      (sum, val) => sum + val,
      0,
    );
    if (totalCount === 0) {
      for (let i = 1; i <= 5; i++) {
        ratingPercentages[i] = 0;
      }
    } else {
      let accumulated = 0;
      for (let i = 0; i < 5; i++) {
        const rating = i + 1;
        if (i < 4) {
          const percent = parseFloat(
            (((ratingCounts[rating] || 0) / totalCount) * 100).toFixed(1),
          );
          ratingPercentages[rating] = percent;
          accumulated += percent;
        } else {
          ratingPercentages[rating] = parseFloat(
            (100 - accumulated).toFixed(1),
          );
        }
      }
    }

    return {
      totalPages: Math.ceil(total / limit),
      list: reviews,
      currentPage: page,
      ratingCounts,
      ratingPercentages,
      totalRating,
    };
  }

  async createSingleDummyReview() {
    const dummyMoverId = "1503b09e-41a3-48f7-af15-7643e8c1a38d";
    const dummyQuotationId = "08a625e2-29a9-42e7-8b28-7f6174386915";
    const dummyCustomerId = "39d35584-a217-4f35-9575-f6ee81a9180b";

    const review = this.moverReviewRepository.create({
      content: faker.lorem.sentences(2),
      rating: faker.number.int({ min: 1, max: 5 }),
      customerNick: "테스트***",
      moverId: dummyMoverId,
      quotationId: dummyQuotationId,
      customerId: dummyCustomerId,
      createdAt: faker.date.recent({ days: 10 }),
      updatedAt: new Date(),
    });

    return await this.moverReviewRepository.save(review);
  }
}
