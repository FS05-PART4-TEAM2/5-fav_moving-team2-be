import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { LikeMover } from "./likeMover.entity";
import { Mover } from "src/mover/mover.entity";
import { GetLikeMoverData } from "./dto/get-like-mover-list.response.dto";
import {
  PaginatedScrollDto,
  PaginatedScrollResponseDto,
} from "src/common/dto/pagination.dto";

@Injectable()
export class likeMoverService {
  constructor(
    @InjectRepository(LikeMover)
    private likeRepository: Repository<LikeMover>,
    @InjectRepository(Mover)
    private moverRepository: Repository<Mover>,
    private readonly dataSource: DataSource,
  ) {}

  async postLikeMoverByCustomer(
    userId: string,
    userType: string,
    moverId: string,
  ): Promise<LikeMover> {
    // 유저 타입이 mover 일 때 예외처리
    if (userType === "mover") {
      throw new UnauthorizedException("기사 계정으로 할 수 없는 기능입니다.");
    }
    // 이미 mover를 찜했을 때 예외처리
    const existLike = await this.likeRepository.exists({
      where: {
        customerId: userId,
        moverId,
      },
    });

    if (existLike) {
      throw new BadRequestException("이미 찜한 기사입니다.");
    }

    return this.increaseLikeAndSave(userId, moverId);
  }

  async increaseLikeAndSave(
    userId: string,
    moverId: string,
  ): Promise<LikeMover> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // likeCount +1
      await queryRunner.manager.update(
        Mover,
        { id: moverId },
        { likeCount: () => "likeCount + 1" },
      );

      // Like 생성 및 저장
      const liked = queryRunner.manager.create(LikeMover, {
        customerId: userId,
        moverId,
      });
      const saved = await queryRunner.manager.save(liked);

      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        "트랜잭션 처리 중 오류가 발생했습니다.",
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteLikeMoverByCustomer(
    userId: string,
    userType: string,
    moverId: string,
  ): Promise<null> {
    // 유저 타입이 mover 일 때 예외처리
    if (userType === "mover") {
      throw new UnauthorizedException("기사 계정으로 할 수 없는 기능입니다.");
    }
    // 이미 mover를 찜했을 때 예외처리
    const existLike = await this.likeRepository.exists({
      where: {
        customerId: userId,
        moverId,
      },
    });

    if (!existLike) {
      throw new BadRequestException("찜하지 않은 기사입니다.");
    }

    return this.decreaseLikeAndSave(userId, moverId);
  }

  async decreaseLikeAndSave(userId: string, moverId: string): Promise<null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // likeCount -1
      await queryRunner.manager.update(
        Mover,
        { id: moverId },
        { likeCount: () => "likeCount - 1" },
      );

      // Like 삭제
      await queryRunner.manager.delete(LikeMover, {
        customerId: userId,
        moverId,
      });

      await queryRunner.commitTransaction();
      return null;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        "트랜잭션 처리 중 오류가 발생했습니다.",
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getLikeMoverList(
    user: { userId: string; userType: string },
    paginationScrollDto: PaginatedScrollDto,
  ): Promise<PaginatedScrollResponseDto<GetLikeMoverData>> {
    const { userId, userType } = user;

    const page = Math.max(paginationScrollDto.page, 1);
    const limit = paginationScrollDto.limit || 8;
    const skip = (page - 1) * limit;

    if (userType !== "customer") {
      throw new UnauthorizedException("손님 전용 API입니다.");
    }

    const likedMovers = await this.likeRepository
      .createQueryBuilder("like")
      .innerJoin("mover", "mover", "like.moverId = mover.id::text")
      .where("like.customerId = :userId", { userId })
      .andWhere("mover.isProfile = true")
      .select([
        `mover.id AS "id"`,
        `mover.idNum AS "idNum"`,
        `mover.nickname AS "nickName"`,
        `mover.profileImage AS "profileImage"`,
        `mover.serviceList AS "serviceList"`,
        `mover.likeCount AS "likeCount"`,
        `mover.totalRating / NULLIF(mover.reviewCounts, 0) AS "totalRating"`, // 평균 별점
        `mover.reviewCounts AS "reviewCounts"`,
        `mover.intro AS "intro"`,
        `mover.career AS "career"`,
        `mover.confirmedCounts AS "confirmedCounts"`,
        `mover.createdAt AS "createdAt"`,
      ])
      .addSelect("true", "isLiked")
      .addSelect(
        `CASE
            WHEN EXISTS (
              SELECT 1 FROM assign_mover assign
              WHERE assign."customerId" = :userId
                AND assign."moverId" = mover.id::text
            )
            THEN true
            ELSE false
          END`,
        "isAssigned",
        )
      .setParameter("userId", userId)
      .take(limit)
      .skip(skip)
      .orderBy("mover.createdAt", "DESC")
      .getRawMany();

    const total = await this.likeRepository
      .createQueryBuilder("like")
      .where("like.customerId = :userId", { userId })
      .getCount();

    return new PaginatedScrollResponseDto<GetLikeMoverData>(
      likedMovers,
      total,
      page,
      limit,
    );
  }
}
