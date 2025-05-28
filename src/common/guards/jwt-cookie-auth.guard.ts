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
    let accessToken = request.cookies["accessToken"] as string;

    if (!accessToken) {
      const authHeader = request.headers["authorization"];
      if (authHeader?.startsWith("Bearer ")) {
        accessToken = authHeader.replace("Bearer ", "");
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
      request.user = { userId: user.userId };
      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired access token.");
    }
  }
}
