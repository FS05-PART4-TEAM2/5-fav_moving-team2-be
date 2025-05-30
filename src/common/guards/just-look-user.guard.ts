import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "../../auth/auth.service";

@Injectable()
export class JustLookUserGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.cookies["accessToken"];

    const user = await this.authService.findByToken(accessToken);
    if (user) {
      request.user = { userId: user.userId, userType: user.userType };
    }
    return true;
  }
}
