import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: (req) => req?.cookies?.accessToken || null,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "dev-secret",
    });
  }

  async validate(payload: any) {
    const token = payload.token;
    const auth = await this.authService.findByToken(token);
    console.log("auth", auth);
    if (!auth || auth.logoutAt) {
      throw new UnauthorizedException("로그아웃된 토큰입니다.");
    }
    return payload;
  }
}
