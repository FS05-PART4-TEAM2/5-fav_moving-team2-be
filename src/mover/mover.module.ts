import { Module } from "@nestjs/common";
import { MoverAuthModule } from "./auth/auth.module";
import { MoverProfileController } from "./controllers/mover-profile.controller";
import { MoverProfileService } from "./services/mover-profile.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Mover } from "./mover.entity";
import { StorageModule } from "src/common/storage/storage.module";
import { AuthModule } from "src/auth/auth.module";
import { MoverInfoController } from "./controllers/mover-info.controller";
import { MoverInfoService } from "./services/mover-info.service";
import { AssignMover } from "src/quotation/entities/assign-mover.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Mover]),
    TypeOrmModule.forFeature([AssignMover]),
    StorageModule,
    MoverAuthModule,
    AuthModule,
  ],
  controllers: [MoverProfileController, MoverInfoController],
  providers: [MoverProfileService, MoverInfoService],
})
export class MoverModule {}
