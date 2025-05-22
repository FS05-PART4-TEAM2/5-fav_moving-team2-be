import { forwardRef, Module } from "@nestjs/common";
import { CustomerAuthController } from "./auth.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "../customer.entity";
import { CustomerAuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule as CommonAuthModule } from "src/auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]),
    JwtModule.register({}),
    forwardRef(() => CommonAuthModule),
  ],
  providers: [CustomerAuthService],
  controllers: [CustomerAuthController],
  exports: [CustomerAuthService],
})
export class CustomerAuthModule {}
