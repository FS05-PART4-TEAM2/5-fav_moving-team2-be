import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import {
  Strategy,
  StrategyOptionsWithRequest,
  VerifyCallback,
} from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(private configService: ConfigService) {
    const options: StrategyOptionsWithRequest = {
      clientID: configService.get("GOOGLE_CLIENT_ID")!,
      clientSecret: configService.get("GOOGLE_CLIENT_SECRET")!,
      callbackURL: configService.get("GOOGLE_REDIRECT_URI")!,
      scope: ["email", "profile"],
      passReqToCallback: true,
    };

    super(options);
  }

  validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): any {
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
