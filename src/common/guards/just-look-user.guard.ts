import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { AuthService } from "../../auth/auth.service";

@Injectable()
export class JustLookUserGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let accessToken = request.headers["access-token"];

    const authHeader = request.headers["authorization"];
    if (authHeader?.startsWith("Bearer ")) {
      accessToken = authHeader.replace("Bearer ", "");
    }

    const user = await this.authService.findByToken(accessToken);
    if (user) {
      request.user = { userId: user.userId, userType: user.userType };
    }
    return true;
  }
}
