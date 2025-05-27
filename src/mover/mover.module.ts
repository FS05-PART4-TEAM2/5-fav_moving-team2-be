import { Module } from "@nestjs/common";
import { MoverAuthModule } from "./auth/auth.module";
import { MoverProfileController } from "./controllers/mover-profile.controller";
import { MoverProfileService } from "./services/mover-profile.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Mover } from "./mover.entity";
import { StorageModule } from "src/common/storage/storage.module";
import { AuthModule } from "src/auth/auth.module";
import { MoverListController } from "./controllers/mover-list.controller";
import { MoverListService } from "./services/mover-list.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Mover]),
    StorageModule,
    MoverAuthModule,
    AuthModule,
  ],
  controllers: [MoverProfileController, MoverListController],
  providers: [MoverProfileService, MoverListService],
})
export class MoverModule {}
