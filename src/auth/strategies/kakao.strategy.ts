import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { Strategy as KakaoOAuthStrategy } from "passport-kakao";

@Injectable()
export class KakaoStrategy extends PassportStrategy(
  KakaoOAuthStrategy,
  "kakao",
) {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>("KAKAO_CLIENT_ID"),
      callbackURL: configService.get<string>("KAKAO_REDIRECT_URI"),
      clientSecret: configService.get<string>("KAKAO_REDIRECT_URI"),
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    const state = req.query.state;

    if (typeof state !== "string") {
      throw new UnauthorizedException("역할 정보가 올바르지 않습니다.");
    }

    const decoded = decodeURIComponent(state);
    const parsed = JSON.parse(decoded);
    const role = parsed.role;

    if (role !== "customer" && role !== "mover") {
      throw new UnauthorizedException("존재하지 않는 역할 정보입니다.");
    }

    const kakaoAccount = profile._json.kakao_account;

    const user = {
      provider: "kakao",
      email: profile.id + "@test.email",
      name: kakaoAccount.profile?.nickname,
      photo:
        "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg",
      role,
    };

    done(null, user);
  }
}
