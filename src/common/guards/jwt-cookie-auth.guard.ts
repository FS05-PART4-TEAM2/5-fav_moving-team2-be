import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "../../auth/auth.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtCookieAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let accessToken = request.headers["access-token"];

    // production 환경인지 체크
    const isProd = this.configService.get("NODE_ENV") === "production";

    if (isProd) {
      accessToken = request.cookies?.accessToken;
    } else {
      const authHeader = request.headers["authorization"];

      if (authHeader?.startsWith("Bearer ")) {
        accessToken = authHeader.replace("Bearer ", "");
      } else {
        // fallback: access-token 헤더도 고려
        accessToken = request.headers["access-token"];
      }
    }

    if (!accessToken) {
      throw new UnauthorizedException("Access token is missing in cookies.");
    }

    try {
      const user = await this.authService.findByToken(accessToken);
      if (!user) {
        throw new UnauthorizedException("존재하지않는 AccessToken입니다.");
      }

      if (user.logoutAt) {
        throw new UnauthorizedException("로그아웃된 토큰입니다.");
      }

      request.user = {
        userId: user.userId,
        userType: user.userType,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Invalid or expired access token.");
    }
  }
}
