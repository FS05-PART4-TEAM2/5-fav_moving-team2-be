import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "../customer.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
