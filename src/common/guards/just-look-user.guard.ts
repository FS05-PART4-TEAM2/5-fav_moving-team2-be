import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { AuthService } from "../../auth/auth.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JustLookUserGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // production 환경인지 체크
    const isProd = this.configService.get("NODE_ENV") === "production";
    let accessToken: string | undefined;

    if (isProd) {
      accessToken = request.cookies?.accessToken;
    } else {
      const authHeader = request.headers["authorization"];
      if (authHeader?.startsWith("Bearer ")) {
        accessToken = authHeader.replace("Bearer ", "");
      } else {
        accessToken = request.headers["access-token"];
      }
    }

    if (accessToken) {
      const user = await this.authService.findByToken(accessToken);
      if (user && !user.logoutAt) {
        request.user = { userId: user.userId, userType: user.userType };
      }
    }

    return true;
  }
}
