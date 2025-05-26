import { forwardRef, Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { GoogleStrategy } from "./strategies/google.strategy";
import { CustomerAuthModule } from "src/customer/auth/auth.module";
import { JwtModule } from "@nestjs/jwt";
import { MoverAuthModule } from "src/mover/auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Auth } from "./auth.entity";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { CustomerAuthService } from "../customer/auth/auth.service";
import { Customer } from "../customer/customer.entity";
import { Mover } from "../mover/mover.entity";
import { MoverAuthService } from "src/mover/auth/auth.service";
import { NaverStrategy } from "./strategies/naver.strategy";

@Module({
  imports: [
    PassportModule,
    forwardRef(() => CustomerAuthModule),
    forwardRef(() => MoverAuthModule),
    JwtModule.register({}),
    TypeOrmModule.forFeature([Auth, Customer, Mover]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    NaverStrategy,
    JwtStrategy,
    CustomerAuthService,
    MoverAuthService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
