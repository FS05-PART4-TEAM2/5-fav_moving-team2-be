import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Mover } from "../mover.entity";
import { LessThan, Like, MoreThan, Repository } from "typeorm";
import { MoverListRequestDto } from "../dto/mover-list.request.dto";
import { FindMoverData } from "../dto/mover-list.response.dto";
import { InfiniteScrollResponseDto } from "src/common/dto/infinite-scroll.dto";

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

    const where: any = keyword ? { nickname: Like(`%${keyword}%`) } : {};

    if (cursor) {
      where.idNum = LessThan(cursor);
    }
    const movers = await this.moverRepository.find({
      where,
      take: limit + 1,
      order: {
        idNum: "DESC",
      },
    });

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
      };
    });

    return {
      data: moverInfos,
      nextCursor,
      hasNext,
    };
  }
}
