import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Mover } from "../mover.entity";
import { LessThan, Like, MoreThan, Repository } from "typeorm";
import { MoverListRequestDto } from "../dto/mover-list.request.dto";
import { FindMoverData } from "../dto/mover-list.response.dto";
import { InfiniteScrollResponseDto } from "src/common/dto/infinite-scroll.dto";
import getCursorField from "src/common/utils/get-cursor-field.util";

@Injectable()
export class MoverInfoService {
  constructor(
    @InjectRepository(Mover)
    private moverRepository: Repository<Mover>,
  ) {}

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
      cursor,
      limit = 10,
    } = moverListRequestDto;

    const qb = this.moverRepository.createQueryBuilder("mover");

    // 키워드
    if (keyword) {
      qb.andWhere("mover.nickname LIKE :keyword", { keyword: `%${keyword}%` });
    }

    // 서비스 가능 지역
    if (region) {
      qb.andWhere(":region = ANY(mover.serviceArea)", { region });
    }

    // 서비스 종류
    if (service) {
      qb.andWhere(":service = ANY(mover.serviceList)", { service });
    }

    // 정렬 기준에 따른 orderBy 속성 변경 로직
    switch (orderBy) {
      case "BESTRATING":
        qb.orderBy("mover.totalRating", "DESC").addOrderBy(
          "mover.idNum",
          "DESC",
        );
        if (cursor) {
          qb.andWhere("mover.idNum < :cursor", { cursor });
        }
        break;
      case "HIGHESTEXP":
        qb.orderBy("mover.career", "DESC").addOrderBy("mover.idNum", "DESC");
        if (cursor) {
          qb.andWhere("mover.idNum < :cursor", { cursor });
        }
        break;
      case "MOSTCONFIRM":
        qb.orderBy("mover.confirmedCounts", "DESC").addOrderBy("mover.idNum", "DESC");
        if (cursor) {
          qb.andWhere("mover.idNum < :cursor", { cursor });
        }
        break;
      case "MOSTREVIEW":
        qb.orderBy("mover.reviewCounts", "DESC").addOrderBy("mover.idNum", "DESC");
        if (cursor) {
          qb.andWhere("mover.idNum < :cursor", { cursor });
        }
        break;
      default:
        qb.orderBy("mover.idNum", "DESC");
        if (cursor) {
          qb.andWhere("mover.idNum < :cursor", { cursor });
        }
    }

    const movers = await qb.take(limit + 1).getMany();

    const hasNext = movers.length > limit;
    const result = hasNext ? movers.slice(0, limit) : movers;
    const nextCursor = hasNext ? result[result.length - 1].idNum : null;

    const moverInfos: FindMoverData[] = result.map((mover) => {
      return {
        id: mover.id,
        idNum: mover.idNum,
        nickname: mover.nickname,
        isProfile: mover.isProfile,
        isLiked: false, // 찜한 기사인지 여부 - 추후 로직 추가 예정
        isAssigned: false, // 지정 기사인지 여부 - 추후 로직 추가 예정
        career: mover.career,
        intro: mover.intro,
        confirmedCounts: mover.confirmedCounts,
        reviewCounts: mover.reviewCounts,
        likeCount: mover.likeCount,
        totalRating: mover.totalRating,
      };
    });

    return {
      data: moverInfos,
      nextCursor,
      hasNext,
    };
  }
}
