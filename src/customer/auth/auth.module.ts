import { Module } from "@nestjs/common";
import { CustomerAuthController } from "./auth.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "../customer.entity";
import { CustomerAuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), JwtModule.register({})],
  providers: [CustomerAuthService],
  controllers: [CustomerAuthController],
  exports: [CustomerAuthService],
})
export class CustomerAuthModule {}
