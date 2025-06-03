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

  async increaseLikeAndSave(userId: string, moverId: string): Promise<LikeMover> {
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
}
