import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "../../auth/auth.service";

@Injectable()
export class JwtCookieAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let accessToken = request.headers["access-token"];

    const authHeader = request.headers["authorization"];

    if (authHeader?.startsWith("Bearer ")) {
      accessToken = authHeader.replace("Bearer ", "");
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
      console.log("JWT Cookie Auth Guard: User authenticated", request.user);

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Invalid or expired access token.");
    }
  }
}
