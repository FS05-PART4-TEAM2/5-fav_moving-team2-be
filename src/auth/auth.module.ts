<<<<<<< HEAD
import { Module } from '@nestjs/common';

@Module({})
=======
import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { GoogleStrategy } from "./strategies/google.strategy";
import { CustomerAuthModule } from "src/customer/auth/auth.module";

@Module({
  imports: [PassportModule, CustomerAuthModule],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy],
})
>>>>>>> 9bdc4c76cbdb6a9eb13e33cb878e9f2c8dd6d4db
export class AuthModule {}
