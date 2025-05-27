import { Module } from "@nestjs/common";
import { MoverAuthModule } from "./auth/auth.module";
import { MoverProfileController } from "./controllers/mover-profile.controller";
import { MoverProfileService } from "./services/mover-profile.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Mover } from "./mover.entity";
import { StorageModule } from "src/common/storage/storage.module";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Mover]),
    StorageModule,
    MoverAuthModule,
    AuthModule,
  ],
  controllers: [MoverProfileController],
  providers: [MoverProfileService],
})
export class MoverModule {}
