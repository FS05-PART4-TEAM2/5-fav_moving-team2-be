import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
import { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";
import { CustomerAuthService } from "src/customer/auth/auth.service";
import { ApiResponse } from "src/common/dto/api-response.dto";
import {
  CustomerOauthLoginResponseDto,
  MoverOauthLoginResponseDto,
} from "src/customer/auth/dto/oauthLogin.dto";
import { SafeCustomer } from "src/customer/types/customerWithoutPw";
import { SafeMover } from "src/customer/types/moverWithoutPw";
import { MoverAuthService } from "src/mover/auth/auth.service";
import { SetAuthCookies } from "src/common/utils/set-auth-cookies.util";

@Controller("api/auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly customerAuthService: CustomerAuthService,
    private readonly moverAuthService: MoverAuthService,
  ) {}

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
  async googleRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<SafeCustomer | SafeMover>> {
    let userInfo: CustomerOauthLoginResponseDto | MoverOauthLoginResponseDto;
    //req.user의 role에 따라 분기처리 예정
    if (req.user?.role === "customer") {
      // 손님 OAuth 로그인 일 때
      userInfo = await this.customerAuthService.signUpOrSignInByOauthCustomer(
        req.user,
      );
      SetAuthCookies.set(res, userInfo.accessToken, userInfo.refreshToken);
      return ApiResponse.success(userInfo.customer, "로그인 완료");
    }
    if (req.user?.role === "mover") {
      // 기사 OAuth 로그인 일 때
      userInfo = await this.moverAuthService.signUpOrSignInByOauthMover(
        req.user,
      );
      SetAuthCookies.set(res, userInfo.accessToken, userInfo.refreshToken);
      return ApiResponse.success(userInfo.mover, "로그인 완료");
    }
    throw new BadRequestException();
  }
}
