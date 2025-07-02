import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoverReview } from "./moverReview.entity";
import { Repository } from "typeorm";
import {
  ReviewPaginationResponseDto,
  CustomerReviewPaginationResponseDto,
  PaginationDto,
} from "src/common/dto/pagination.dto";
import { faker } from "@faker-js/faker";
import { Mover } from "src/mover/mover.entity";
import { CreateMoverReviewDto } from "./dto/createReview.request.dto";
import { Customer } from "src/customer/customer.entity";
import { ReceivedQuote } from "src/quotation/entities/received-quote.entity";
import { Quotation } from "src/quotation/quotation.entity";
import { StorageService } from "@/common/interfaces/storage.service";

@Injectable()
export class MoverReviewService {
  constructor(
    @InjectRepository(MoverReview)
    private moverReviewRepository: Repository<MoverReview>,
    @InjectRepository(Mover)
    private moverRepository: Repository<Mover>,
    @InjectRepository(ReceivedQuote)
    private receivedQuotationRepository: Repository<ReceivedQuote>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Quotation)
    private quotationRepository: Repository<Quotation>,
    @Inject("StorageService")
    private readonly storageService: StorageService,
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
      .select([
        `mover.totalRating AS "totalRating"`,
        `mover.reviewCounts AS "reviewCounts"`,
      ])
      .where("mover.id = :moverId", { moverId })
      .getRawOne();

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
      totalRating:
        totalRating.reviewCounts > 0
          ? totalRating.totalRating / totalRating.reviewCounts
          : 0,
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

  // 작성 가능한 리뷰 조회
  async getAvailableMoverReviews(
    customerId: string,
    paginationDto: PaginationDto,
  ): Promise<CustomerReviewPaginationResponseDto> {
    const { page, limit } = paginationDto;
    const offset = (page - 1) * limit;
    // 완료되었지만 리뷰를 작성하지 않은 견적 조회
    const [receivedQuotations, total] =
      await this.receivedQuotationRepository.findAndCount({
        where: {
          customerId,
          isCompleted: true,
          isConfirmedMover: true,
          isReviewed: false,
        },
        skip: offset,
        take: limit,
        order: { createdAt: "DESC" },
      });

    const reviewsWithDetails = await Promise.all(
      receivedQuotations.map(async (receivedQuotation) => {
        const mover = await this.moverRepository.findOne({
          where: { id: receivedQuotation.moverId },
          select: ["username", "serviceList", "profileImage"],
        });

        const quotation = await this.quotationRepository.findOne({
          where: { id: receivedQuotation.quotationId },
          select: [
            "moveDate",
            "startAddress",
            "endAddress",
            "moveType",
            "price",
            "assignMover",
            "createdAt",
            "status",
          ],
        });

        // status가 COMPLETED가 아니면 리뷰 작성 불가
        console.log(quotation?.status);
        if (quotation?.status !== "COMPLETED") return null;

        let profileImage = mover?.profileImage || null;

        // if (
        //   typeof this.storageService.getSignedUrlFromS3Url === "function" &&
        //   profileImage !== null
        // ) {
        //   profileImage =
        //     await this.storageService.getSignedUrlFromS3Url(profileImage);
        // }

        return {
          content: "",
          rating: 0,
          reviewDate: null,
          moverName: mover?.username || "알 수 없음",
          moverProfileImage: profileImage,
          moveDate: quotation?.moveDate || "",
          startAddress: quotation?.startAddress || "",
          endAddress: quotation?.endAddress || "",
          moveType: quotation?.moveType || "UNKNOWN",
          price: quotation?.price || "0",
          isAssignedMover:
            quotation?.assignMover?.includes(receivedQuotation.moverId) ||
            false,
          offerId: receivedQuotation.id,
        };
      }),
    ).then((results) => results.filter((result) => result !== null));

    const totalPages = Math.ceil(reviewsWithDetails.length / limit);

    return {
      totalPages,
      currentPage: page,
      totalCount: reviewsWithDetails.length,
      list: reviewsWithDetails,
    };
  }

  // 일반유저 리뷰 작성
  async createMoverReview(
    createReviewDto: CreateMoverReviewDto,
  ): Promise<MoverReview> {
    const receivedQuotation = await this.receivedQuotationRepository.findOne({
      where: { id: createReviewDto.offerId },
    });

    if (!receivedQuotation) {
      throw new BadRequestException("존재하지 않는 요청입니다.");
    }

    if (createReviewDto.userId !== receivedQuotation.customerId) {
      throw new BadRequestException("리뷰 작성 권한이 없습니다.");
    }

    const existingReview = await this.receivedQuotationRepository.findOne({
      where: {
        id: createReviewDto.offerId,
        customerId: createReviewDto.userId,
        isReviewed: true,
      },
    });

    if (existingReview) {
      throw new BadRequestException("이미 해당 요청에 리뷰를 작성하였습니다.");
    }

    const customer = await this.customerRepository.findOne({
      where: { id: createReviewDto.userId },
    });

    const customerNick = customer?.username;

    const review = this.moverReviewRepository.create({
      content: createReviewDto.content,
      rating: createReviewDto.rating,
      moverId: receivedQuotation.moverId,
      quotationId: receivedQuotation.quotationId,
      customerId: createReviewDto.userId,
      customerNick: customerNick,
    });
    const savedReview = await this.moverReviewRepository.save(review);

    await this.updateMoverReviewStats(
      receivedQuotation.moverId,
      createReviewDto.rating,
    );

    await this.receivedQuotationRepository.update(
      { id: createReviewDto.offerId },
      { isReviewed: true },
    );
    return savedReview;
  }

  private async updateMoverReviewStats(
    moverId: string,
    newRating: number,
  ): Promise<void> {
    const mover = await this.moverRepository.findOne({
      where: { id: moverId },
      select: ["reviewCounts", "totalRating"],
    });

    if (!mover) {
      throw new BadRequestException("기사를 찾을 수 없습니다.");
    }

    const newReviewCount = mover.reviewCounts + 1;
    const newTotalRating = mover.totalRating + newRating;

    await this.moverRepository.update(
      { id: moverId },
      {
        reviewCounts: newReviewCount,
        totalRating: newTotalRating,
      },
    );
  }

  // 일반유저 : 작성한 리뷰 조회
  async getCustomerReview(
    customerId: string,
    paginationDto: PaginationDto,
  ): Promise<CustomerReviewPaginationResponseDto> {
    const { page, limit } = paginationDto;
    const offset = (page - 1) * limit;

    const [reviews, total] = await this.moverReviewRepository.findAndCount({
      where: { customerId },
      skip: offset,
      take: limit,
      order: { createdAt: "DESC" },
    });

    const reviewsWithDetails = await Promise.all(
      reviews.map(async (review) => {
        const mover = await this.moverRepository.findOne({
          where: { id: review.moverId },
          select: ["username", "serviceList", "profileImage"],
        });

        const quotation = await this.quotationRepository.findOne({
          where: { id: review.quotationId },
          select: [
            "moveDate",
            "startAddress",
            "endAddress",
            "moveDate",
            "moveType",
            "price",
            "assignMover",
            "createdAt",
          ],
        });

        let profileImage = mover?.profileImage || null;

        // if (
        //   typeof this.storageService.getSignedUrlFromS3Url === "function" &&
        //   profileImage !== null
        // ) {
        //   profileImage =
        //     await this.storageService.getSignedUrlFromS3Url(profileImage);
        // }

        return {
          content: review.content,
          rating: review.rating,
          reviewDate: review.createdAt,
          moverName: mover?.username || "알 수 없음",
          moverProfileImage: profileImage,
          moveDate: quotation?.moveDate || "",
          startAddress: quotation?.startAddress || "",
          endAddress: quotation?.endAddress || "",
          moveType: quotation?.moveType || "UNKNOWN",
          price: quotation?.price || "0",
          isAssignedMover:
            quotation?.assignMover?.includes(review.moverId) || false,
        };
      }),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      totalPages,
      currentPage: page,
      totalCount: total,
      list: reviewsWithDetails,
    };
  }
}
