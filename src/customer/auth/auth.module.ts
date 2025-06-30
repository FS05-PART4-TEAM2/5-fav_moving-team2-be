import { forwardRef, Module } from "@nestjs/common";
import { CustomerAuthController } from "./auth.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "../customer.entity";
import { CustomerAuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { StorageModule } from "src/common/storage/storage.module";
import { AuthModule as CommonAuthModule } from "src/auth/auth.module";
import { QuotationModule } from "src/quotation/quotation.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]),
    StorageModule,
    JwtModule.register({}),
    forwardRef(() => CommonAuthModule),
    QuotationModule, // QuotationModule 추가
  ],
  providers: [CustomerAuthService],
  controllers: [CustomerAuthController],
  exports: [CustomerAuthService],
})
export class CustomerAuthModule {}
