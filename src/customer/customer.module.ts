import { Module } from "@nestjs/common";
import { CustomerAuthModule } from "./auth/auth.module";
import { CustomerProfileController } from "src/customer/controllers/customer-profile.controller";
import { CustomerProfileService } from "src/customer/services/customer-profile.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "./customer.entity";
import { StorageModule } from "src/common/storage/storage.module";
import { AuthModule } from "src/auth/auth.module";
import { Quotation } from "src/quotation/quotation.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, Quotation]),
    CustomerAuthModule,
    StorageModule,
    AuthModule,
  ],
  controllers: [CustomerProfileController],
  providers: [CustomerProfileService],
})
export class CustomerModule {}
