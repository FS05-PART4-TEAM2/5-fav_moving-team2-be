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
      list: moverInfos,
      orderNextCursor: orderNextCursor ?? null,
      idNumNextCursor: idNumNextCursor ?? null,
      hasNext,
    };
  }
}
