import { forwardRef, Module } from "@nestjs/common";
import { MoverAuthService } from "./auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MoverAuthController } from "./auth.controller";
import { Mover } from "../mover.entity";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule as CommonAuthModule } from "src/auth/auth.module";
import { StorageModule } from "src/common/storage/storage.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Mover]),
    JwtModule.register({}),
    forwardRef(() => CommonAuthModule), // Use forwardRef for circular DI
    StorageModule,
  ],
  providers: [MoverAuthService],
  controllers: [MoverAuthController],
  exports: [MoverAuthService],
})
export class MoverAuthModule {}
