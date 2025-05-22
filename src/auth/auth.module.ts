import { forwardRef, Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { GoogleStrategy } from "./strategies/google.strategy";
import { CustomerAuthModule } from "src/customer/auth/auth.module";
import { JwtModule } from "@nestjs/jwt";
import { MoverAuthModule } from "src/mover/auth/auth.module";

@Module({
  imports: [PassportModule, forwardRef(() => CustomerAuthModule), forwardRef(() => MoverAuthModule), JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
