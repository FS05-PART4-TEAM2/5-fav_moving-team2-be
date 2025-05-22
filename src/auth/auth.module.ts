import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { GoogleStrategy } from "./strategies/google.strategy";
import { CustomerAuthModule } from "src/customer/auth/auth.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [PassportModule, CustomerAuthModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
