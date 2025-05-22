import { forwardRef, Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Mover } from "../mover.entity";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule as CommonAuthModule } from "src/auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Mover]),
    JwtModule.register({}),
    forwardRef(() => CommonAuthModule), // Use forwardRef for circular DI
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
