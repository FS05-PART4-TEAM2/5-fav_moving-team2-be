import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import {
  Strategy,
  StrategyOptions,
  VerifyCallback,
} from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(private configService: ConfigService) {
    const options: StrategyOptions = {
      clientID: configService.get("GOOGLE_CLIENT_ID")!,
      clientSecret: configService.get("GOOGLE_CLIENT_SECRET")!,
      callbackURL: configService.get("GOOGLE_REDIRECT_URI")!,
      scope: ["email", "profile"],
    };

    super(options);
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const role = req.session?.oauthrole; // 구글 로그인 요청 uri의 param에서 role을 가져옴
    if (!role) {
      throw new UnauthorizedException("Role 정보를 입력하세요.");
    }
    const { name, emails, photos } = profile;

    const user = {
      email: emails[0].value,
      name: name.givenName,
      photo: photos[0].value,
      provider: profile.provider,
      providerId: profile.id,
      role,
    };

    done(null, user); // req.user에 전달됨
  }
}
