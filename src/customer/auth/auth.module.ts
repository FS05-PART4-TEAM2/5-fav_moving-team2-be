import { Module } from "@nestjs/common";
import { CustomerAuthController } from "./auth.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "../customer.entity";
import { CustomerAuthService } from "./auth.service";

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  providers: [CustomerAuthService],
  controllers: [CustomerAuthController],
  exports: [CustomerAuthService],
})
export class CustomerAuthModule {}
