import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Mover } from "../mover.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Mover])],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
