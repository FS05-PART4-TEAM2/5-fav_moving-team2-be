import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Like } from "./like.entity";
import { Mover } from "src/mover/mover.entity";
import { likeMoverService } from "./like.service";
import { LikeMoverController } from "./like.controller";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Like, Mover]),
    AuthModule, // ✅ 반드시 imports 해줘야 의존성 주입 가능
  ],
  providers: [likeMoverService],
  controllers: [LikeMoverController],
})
export class LikeModule {}
