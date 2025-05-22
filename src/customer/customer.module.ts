import { Module } from "@nestjs/common";
import { CustomerAuthModule } from "./auth/auth.module";
import { CustomerProfileController } from "src/customer/controllers/customer-profile.controller";
import { CustomerProfileService } from "src/customer/services/customer-profile.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "./customer.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), CustomerAuthModule],
  controllers: [CustomerProfileController],
  providers: [CustomerProfileService],
})
export class CustomerModule {}
