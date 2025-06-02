import { Module } from "@nestjs/common";
import { MoverReview } from "./moverReview.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { MoverReviewService } from "./moverReview.service";
import { MoverAuthController } from "src/mover/auth/auth.controller";
import { MoverReviewController } from "./moverReview.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([MoverReview]),
    AuthModule,
  ],
  providers: [MoverReviewService],
  controllers: [MoverReviewController],
})
export class MoverReviewModule {}