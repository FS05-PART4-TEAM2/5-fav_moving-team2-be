import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Mover } from "../mover.entity";
import { In, LessThan, Like, MoreThan, Repository } from "typeorm";
import { MoverListRequestDto } from "../dto/mover-list.request.dto";
import { FindMoverData } from "../dto/mover-list.response.dto";
import { InfiniteScrollResponseDto } from "src/common/dto/infinite-scroll.dto";
import getCursorField from "src/common/utils/get-cursor-field.util";
import { MoverDetailResponseDto } from "../dto/mover-detail.response.dto";
import { AssignMover } from "src/quotation/entities/assign-mover.entity";
import { LikeMover } from "src/likeMover/likeMover.entity";
import { Quotation } from "src/quotation/quotation.entity";
import { StorageService } from "@/common/interfaces/storage.service";

@Injectable()
export class MoverInfoService {
  constructor(
    @InjectRepository(Mover)
    private moverRepository: Repository<Mover>,
    @InjectRepository(AssignMover)
    private assignMoverRepository: Repository<AssignMover>,
    @InjectRepository(LikeMover)
    private likeMoverRepository: Repository<LikeMover>,
    @InjectRepository(Quotation)
    private quotationRepository: Repository<Quotation>,
    @Inject("StorageService")
    private readonly storageService: StorageService,
  ) {}

  async getMoverDetail(
    userId: string,
    userType: string,
    moverId: string,
  ): Promise<MoverDetailResponseDto> {
    const mover = await this.moverRepository.findOne({
      where: {
        id: moverId,
      },
    });

    if (!mover) {
      throw new NotFoundException(`${moverId}는 유효하지 않은 기사입니다.`);
    }

    if (!mover.isProfile) {
      throw new BadRequestException("프로필을 등록하지 않은 기사입니다.");
    }

    let isAssigned = false;
    if (userType === "customer") {
      /**
       * @todo
       * 현재 활성화 된 견적일 때만 isAssigned true
       */

      const assignMover = await this.assignMoverRepository.findOne({
        where: {
          customerId: userId,
          moverId: mover.id,
        },
        order: {
          createdAt: "DESC",
        },
      });

      if (assignMover?.quotationId) {
        isAssigned = await this.quotationRepository.exists({
          where: {
            id: assignMover.quotationId,
            status: In(["PENDING", "CONFIRMED"]),
          },
        });
      }
    }

    let isLiked = false;
    if (userType === "customer") {
      isLiked = await this.likeMoverRepository.exists({
        where: {
          customerId: userId,
          moverId: mover.id,
        },
      });
    }

    let profileImage = mover.profileImage;
    if (
      typeof this.storageService.getSignedUrlFromS3Url === "function" &&
      profileImage !== null
    ) {
      profileImage =
        await this.storageService.getSignedUrlFromS3Url(profileImage);
    }

    const moverDetail: MoverDetailResponseDto = {
      id: mover.id,
      idNum: mover.idNum,
      detailDescription: mover.detailDescription,
      nickname: mover.nickname,
      isLiked, // 찜하기 여부
      isAssigned, // 지정 기사 여부
      profileImage: profileImage,
      career: mover.career,
      intro: mover.intro,
      confirmedCounts: mover.confirmedCounts,
      reviewCounts: mover.reviewCounts,
      totalRating:
        mover.reviewCounts > 0 ? mover.totalRating / mover.reviewCounts : 0,
      serviceArea: mover.serviceArea,
      serviceList: mover.serviceList,
      likeCount: mover.likeCount,
    };

    return moverDetail;
  }

  async getMoverList(
    moverListRequestDto: MoverListRequestDto,
    userId: string,
    userType: string,
  ): Promise<InfiniteScrollResponseDto<FindMoverData>> {
    const {
      keyword,
      orderBy,
      region,
      service,
      idNumCursor,
      orderCursor,
      limit = 10,
    } = moverListRequestDto;

    // 기본 필터만 적용한 QueryBuilder
    const qb = this.moverRepository
      .createQueryBuilder("mover")
      .where(`"mover"."isProfile" = true`);

    if (keyword) {
      qb.andWhere(`"mover"."nickname" LIKE :keyword`, {
        keyword: `%${keyword}%`,
      });
    }
    if (region) {
      qb.andWhere(`"mover"."serviceArea" LIKE :region`, {
        region: `%${region}%`,
      });
    }
    if (service) {
      qb.andWhere(`"mover"."serviceList" LIKE :service`, {
        service: `%${service}%`,
      });
    }

    // BESTRATING은 JS 레벨에서 처리
    if (orderBy === "BESTRATING") {
      // 1) 전체(또는 충분히 많은) 레코드 조회
      const allMovers = await qb.getMany();

      // 2) avgRating 계산
      const withAvg = allMovers.map((m) => ({
        ...m,
        avgRating: m.reviewCounts > 0 ? m.totalRating / m.reviewCounts : 0,
      }));

      // 3) JS에서 정렬 (avgRating desc, idNum desc)
      withAvg.sort((a, b) => {
        if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
        return b.idNum - a.idNum;
      });

      // 4) 커서 기반 페이징
      let start = 0;
      if (orderCursor != null && idNumCursor != null) {
        start = withAvg.findIndex(
          (m) =>
            m.avgRating < orderCursor ||
            (m.avgRating === orderCursor && m.idNum < idNumCursor),
        );
        if (start === -1) start = withAvg.length;
      }
      const slice = withAvg.slice(start, start + limit);
      const hasNext = start + limit < withAvg.length;

      // 5) assigned/liked 여부 조회
      const moverIds = slice.map((m) => m.id);
      let assignedSet = new Set<string>();
      let likedSet = new Set<string>();
      if (userType === "customer" && userId && moverIds.length) {
        assignedSet = await this.getActiveAssignedMoverIds(userId, moverIds);
        const likes = await this.likeMoverRepository.find({
          where: { customerId: userId, moverId: In(moverIds) },
          select: ["moverId"],
        });
        likedSet = new Set(likes.map((l) => l.moverId));
      }

      // 6) DTO로 매핑
      const list: FindMoverData[] = await Promise.all(
        slice.map(async (m) => ({
          id: m.id,
          idNum: m.idNum,
          nickname: m.nickname,
          isLiked: likedSet.has(m.id),
          isAssigned: assignedSet.has(m.id),
          profileImage: m.profileImage
            ? typeof this.storageService.getSignedUrlFromS3Url === "function"
              ? await this.storageService.getSignedUrlFromS3Url(m.profileImage)
              : m.profileImage
            : null,
          career: m.career,
          intro: m.intro,
          confirmedCounts: m.confirmedCounts,
          reviewCounts: m.reviewCounts,
          likeCount: m.likeCount,
          totalRating: m.avgRating,
          serviceList: m.serviceList,
        })),
      );

      const last = list[list.length - 1];
      return {
        list,
        hasNext,
        orderNextCursor: last?.avgRating ?? 0,
        idNumNextCursor: last?.idNum ?? null,
      };
    }

    // BESTRATING 외 기존 SQL 커서 로직
    const field = getCursorField(orderBy);
    qb.orderBy(`"mover"."${field}"`, "DESC").addOrderBy(
      `"mover"."idNum"`,
      "DESC",
    );

    if (orderCursor != null && idNumCursor != null) {
      qb.andWhere(
        `(
         "mover"."${field}" < :orderCursor
         OR ("mover"."${field}" = :orderCursor AND "mover"."idNum" < :idNumCursor)
       )`,
        { orderCursor, idNumCursor },
      );
    } else if (idNumCursor != null && field === "idNum") {
      qb.andWhere(`"mover"."idNum" < :idNumCursor`, { idNumCursor });
    }

    const entities = await qb.take(limit + 1).getMany();
    const hasNext2 = entities.length > limit;
    const slice2 = hasNext2 ? entities.slice(0, limit) : entities;
    const moverIds2 = slice2.map((m) => m.id);

    let assignedSet2 = new Set<string>();
    let likedSet2 = new Set<string>();
    if (userType === "customer" && userId && moverIds2.length) {
      assignedSet2 = await this.getActiveAssignedMoverIds(userId, moverIds2);
      const likes2 = await this.likeMoverRepository.find({
        where: { customerId: userId, moverId: In(moverIds2) },
        select: ["moverId"],
      });
      likedSet2 = new Set(likes2.map((l) => l.moverId));
    }

    const list2: FindMoverData[] = await Promise.all(
      slice2.map(async (m) => ({
        id: m.id,
        idNum: m.idNum,
        nickname: m.nickname,
        isLiked: likedSet2.has(m.id),
        isAssigned: assignedSet2.has(m.id),
        profileImage: m.profileImage
          ? typeof this.storageService.getSignedUrlFromS3Url === "function"
            ? await this.storageService.getSignedUrlFromS3Url(m.profileImage)
            : m.profileImage
          : null,
        career: m.career,
        intro: m.intro,
        confirmedCounts: m.confirmedCounts,
        reviewCounts: m.reviewCounts,
        likeCount: m.likeCount,
        totalRating: m.reviewCounts > 0 ? m.totalRating / m.reviewCounts : 0,
        serviceList: m.serviceList,
      })),
    );

    const last2 = list2[list2.length - 1]!;
    const rawCursor = (last2 as any)[field];
    const orderNextCursor =
      typeof rawCursor === "number" ? rawCursor : Number(rawCursor) || null;

    return {
      list: list2,
      hasNext: hasNext2,
      orderNextCursor,
      idNumNextCursor: last2.idNum,
    };
  }

  private async getActiveAssignedMoverIds(
    userId: string,
    moverIds: string[],
  ): Promise<Set<string>> {
    if (moverIds.length === 0) return new Set();
    const rows = await this.assignMoverRepository
      .createQueryBuilder("assign")
      .innerJoin(
        "quotation",
        "quotation",
        "assign.quotationId = quotation.id::text",
      )
      .where("assign.customerId = :userId", { userId })
      .andWhere("assign.moverId IN (:...moverIds)", { moverIds })
      .andWhere("quotation.status IN (:...statuses)", {
        statuses: ["PENDING", "CONFIRMED"],
      })
      .select("assign.moverId", "moverId")
      .getRawMany();

    return new Set(rows.map((row) => row.moverId));
  }
}
