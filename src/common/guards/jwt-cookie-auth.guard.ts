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
    const accessToken = request.cookies["accessToken"];

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
