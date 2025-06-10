import {
  BadRequestException,
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

@Injectable()
export class MoverInfoService {
  constructor(
    @InjectRepository(Mover)
    private moverRepository: Repository<Mover>,
    @InjectRepository(AssignMover)
    private assignMoverRepository: Repository<AssignMover>,
    @InjectRepository(LikeMover)
    private likeMoverRepository: Repository<LikeMover>,
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
      isAssigned = await this.assignMoverRepository.exists({
        where: {
          customerId: userId,
          moverId: mover.id,
        },
      });
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

    const moverDetail: MoverDetailResponseDto = {
      id: mover.id,
      idNum: mover.idNum,
      detailDescription: mover.detailDescription,
      nickname: mover.nickname,
      isLiked, // 찜하기 여부
      isAssigned, // 지정 기사 여부
      profileImage: mover.profileImage,
      career: mover.career,
      intro: mover.intro,
      confirmedCounts: mover.confirmedCounts,
      reviewCounts: mover.reviewCounts,
      totalRating: mover.totalRating,
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

    const qb = this.moverRepository.createQueryBuilder("mover");

    qb.andWhere("mover.isProfile = true");

    // 키워드
    if (keyword) {
      qb.andWhere("mover.nickname LIKE :keyword", { keyword: `%${keyword}%` });
    }

    // 서비스 가능 지역
    if (region) {
      qb.andWhere("mover.serviceArea LIKE :region", { region: `%${region}%` });
    }

    // 서비스 종류
    if (service) {
      qb.andWhere("mover.serviceList LIKE :service", {
        service: `%${service}%`,
      });
    }

    // 정렬 기준에 따른 orderBy 속성 변경 로직
    const field = getCursorField(orderBy);
    if (field === "idNum") {
      qb.orderBy("mover.idNum", "DESC");
      if (idNumCursor != null) {
        qb.andWhere("mover.idNum < :idNumCursor", { idNumCursor });
      }
    } else {
      qb.orderBy(`mover.${field}`, "DESC").addOrderBy("mover.idNum", "DESC");
      if (orderCursor != null && idNumCursor != null) {
        qb.andWhere(
          `(mover.${field} < :orderCursor OR (mover.${field} = :orderCursor AND mover.idNum < :idNumCursor))`,
          {
            orderCursor,
            idNumCursor,
          },
        );
      }
    }

    const movers = await qb.take(limit + 1).getMany();

    const hasNext = movers.length > limit;
    const result = hasNext ? movers.slice(0, limit) : movers;
    let orderNextCursor: number | undefined;
    let idNumNextCursor: number | undefined;
    if (hasNext) {
      const lastMover = result[result.length - 1];
      const cursorField = getCursorField(orderBy);
      orderNextCursor = lastMover[cursorField];
      idNumNextCursor = lastMover.idNum;
    }

    let assignedMoverIdSet = new Set<string>();
    let likedMoverIdSet = new Set<string>();

    if (userType === "customer" && userId) {
      const assignedMovers = await this.assignMoverRepository.find({
        where: {
          customerId: userId,
          moverId: In(result.map((mover) => mover.id)),
        },
        select: ["moverId"],
      });
      assignedMoverIdSet = new Set(assignedMovers.map((am) => am.moverId));

      const likedMovers = await this.likeMoverRepository.find({
        where: {
          customerId: userId,
          moverId: In(result.map((mover) => mover.id)),
        },
        select: ["moverId"],
      });
      likedMoverIdSet = new Set(likedMovers.map((lm) => lm.moverId));
    }

    const moverInfos: FindMoverData[] = result.map((mover) => {
      const isAssigned = assignedMoverIdSet.has(mover.id);
      const isLiked = likedMoverIdSet.has(mover.id);
      return {
        id: mover.id,
        idNum: mover.idNum,
        nickname: mover.nickname,
        isLiked, // 찜한 기사인지 여부
        isAssigned, // 지정 기사인지 여부
        profileImage: mover.profileImage,
        career: mover.career,
        intro: mover.intro,
        confirmedCounts: mover.confirmedCounts,
        reviewCounts: mover.reviewCounts,
        likeCount: mover.likeCount,
        totalRating: mover.totalRating,
        serviceList: mover.serviceList,
      };
    });

    return {
      list: moverInfos,
      orderNextCursor: orderNextCursor ?? null, // 기본 값: idNumNextCursor와 일치 - 정렬 없을 때
      idNumNextCursor: idNumNextCursor ?? null,
      hasNext,
    };
  }
}
