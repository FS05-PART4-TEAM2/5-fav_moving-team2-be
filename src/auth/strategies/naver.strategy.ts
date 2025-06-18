import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { Profile, Strategy } from "passport-naver-v2";

interface NaverStrategyOptionsWithRequest {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  passReqToCallback: true;
  profileURL: string;
  scope: string[];
}

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, "naver") {
  constructor(private configService: ConfigService) {
    const options: NaverStrategyOptionsWithRequest = {
      clientID: configService.getOrThrow("NAVER_CLIENT_ID"),
      clientSecret: configService.getOrThrow("NAVER_CLIENT_SECRET"),
      callbackURL: configService.getOrThrow("NAVER_REDIRECT_URI"),
      passReqToCallback: true,
      profileURL: "https://openapi.naver.com/v1/nid/me", // ✅ 명시적으로 선언
      scope: ["name", "email", "nickname"], // ✅ scope 명시
    };

    super(options as any);
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: Function,
  ): Promise<any> {
    const rawState = req.query.state;

    if (typeof rawState !== "string") {
      throw new UnauthorizedException("state 파라미터 누락");
    }

    let role: string;
    try {
      const decoded = Buffer.from(rawState, "base64").toString("utf-8");
      const parsed = JSON.parse(decoded);
      role = parsed.role;
    } catch (err) {
      console.error("❌ state 디코딩 또는 파싱 실패:", rawState);
      throw new UnauthorizedException("state 파싱 실패");
    }

    const { email, name, profileImage } = profile;

    const user = {
      provider: "naver",
      providerId: profile.id,
      email: email,
      name: name,
      photo: profileImage,
      role,
    };

    done(null, user);
  }
}
