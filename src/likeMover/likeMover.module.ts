import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LikeMover } from "./likeMover.entity";
import { Mover } from "src/mover/mover.entity";
import { likeMoverService } from "./likeMover.service";
import { LikeMoverController } from "./likeMover.controller";
import { AuthModule } from "src/auth/auth.module";
import { StorageModule } from "@/common/storage/storage.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([LikeMover, Mover]),
    forwardRef(() => AuthModule),
    StorageModule,
  ],
  providers: [likeMoverService],
  controllers: [LikeMoverController],
  exports: [TypeOrmModule],
})
export class LikeModule {}
