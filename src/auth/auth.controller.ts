import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  UseGuards,
  Post,
  BadRequestException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
import { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";
import { ApiOperation } from "@nestjs/swagger";
import { SetAuthCookies } from "../common/utils/set-auth-cookies.util";
import { ApiResponse } from "../common/dto/api-response.dto";
import { CustomerAuthService } from "../customer/auth/auth.service";
import { AuthService as MoverAuthService } from "../mover/auth/auth.service";
import { AccessToken } from '../common/decorators/access-token.decorator';

@Controller("api/auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly customerAuthService: CustomerAuthService,
    private readonly moverAuthService: MoverAuthService,
  ) {}

  /* 
  가장 핵심적인 문제. 어떻게 역할마다 분리해서 로그인 다르게 처리 할 수 있을까?
  1. strategy를 customer, mover별로 분리해서 각기 다르게 분리 처리한다 (확장성이 낮고 유지보수 떨어짐)
  2. role에 대한 param값을 state에 저장하여 strategy에서 해당 부분을 req에서 읽어온다.
  */
  @Get("google/:role/login")
  async setRoleAndRedirect(@Param("role") role: string, @Res() res: Response) {
    const state = encodeURIComponent(JSON.stringify({ role }));
    const clientId = this.configService.get("GOOGLE_CLIENT_ID");
    const redirectUri = this.configService.get("GOOGLE_REDIRECT_URI");
    const redirectUrl =
      "https://accounts.google.com/o/oauth2/v2/auth" +
      `?client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=code` +
      `&scope=email profile` +
      `&state=${state}`;

    return res.redirect(redirectUrl);
  }

  @Get("google/redirect")
  @UseGuards(AuthGuard("google"))
  googleRedirect(@Req() req: Request) {}

  @Post("refresh")
  @ApiOperation({ summary: "AccessToken 갱신" })
  async refreshAccessToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<{ accessToken: string }>> {
    const refreshToken = req.cookies["refreshToken"];

    if (!refreshToken) {
      throw new BadRequestException("refreshToken이 누락되었습니다.");
    }

    const payload = this.authService.decodeToken(refreshToken);
    const service =
      payload.userType === "customer"
        ? this.customerAuthService
        : this.moverAuthService;

    const { accessToken, refreshToken: newRefreshToken } =
      await service.refreshAccessToken(refreshToken);

    SetAuthCookies.set(res, accessToken, newRefreshToken);
    return ApiResponse.success(
      { accessToken },
      "AccessToken이 갱신되었습니다.",
    );
  }

  @Post("logout")
  @ApiOperation({ summary: "로그아웃" })
  async logout(@AccessToken() accessToken: string, @Res({ passthrough: true }) res: Response): Promise<ApiResponse<null>> {
    await this.authService.logout(accessToken);

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return ApiResponse.success(null, "로그아웃되었습니다.");
  }
}
