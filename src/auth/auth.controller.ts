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

import { CustomerAuthService } from "../customer/auth/auth.service";
import { AccessToken } from "../common/decorators/access-token.decorator";
import { CommonApiResponse } from "src/common/dto/api-response.dto";
import {
  CustomerGoogleOauthLoginResponseDto,
  MoverGoogleOauthLoginResponseDto,
} from "src/common/dto/oauthLogin.dto";
import { SafeCustomer } from "src/customer/types/customerWithoutPw";
import { SafeMover } from "src/customer/types/moverWithoutPw";
import { MoverAuthService } from "src/mover/auth/auth.service";
import { SetAuthCookies } from "src/common/utils/set-auth-cookies.util";
import {
  ApiBadGatewayResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("OAuth") // Swagger 그룹화
@Controller("api/auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly customerAuthService: CustomerAuthService,
    private readonly moverAuthService: MoverAuthService,
  ) {}

  @Get("google/:role/login")
  @ApiOperation({
    summary: "구글 OAuth 로그인",
    description: "구글 OAuth를 사용한 로그인을 진행합니다.",
  })
  @ApiOkResponse({
    description: "성공 시 응답 데이터",
    example: {
      success: true,
      data: {
        id: "1be1a0c8-2e45-4a45-981f-f5b756dee42c",
        username: "동혁",
        email: "hyuk.development@gmail.com",
        isProfile: null,
        authType: null,
        provider: "google",
        phoneNumber: "000-0000-0000",
        profileImage:
          "https://lh3.googleusercontent.com/a/ACg8ocIDnlUuGZT05pI-d9KsJO5_6ouGlbFgej4zTT1Fqh5ai_Lclrw=s96-c",
        wantService: null,
        livingPlace: null,
        createdAt: "2025-05-22T02:33:41.240Z",
      },
      message: "로그인 완료",
    },
  })
  @ApiBadGatewayResponse({
    description: "잘못된 역할 정보일 때",
    example: {
      success: false,
      data: null,
      message: "존재하지 않는 역할 정보입니다.",
      errorCode: "UnauthorizedException",
    },
  })
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

  @Post("refresh")
  @ApiOperation({ summary: "AccessToken 갱신" })
  async refreshAccessToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CommonApiResponse<{ accessToken: string }>> {
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
    return CommonApiResponse.success(
      { accessToken },
      "AccessToken이 갱신되었습니다.",
    );
  }

  @Post("logout")
  @ApiOperation({ summary: "로그아웃" })
  async logout(
    @AccessToken() accessToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CommonApiResponse<null>> {
    await this.authService.logout(accessToken);

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return CommonApiResponse.success(null, "로그아웃되었습니다.");
  }
  
  @Get("google/redirect")
  @UseGuards(AuthGuard("google"))
  @ApiOperation({
    summary: "구글 로그인 성공 시 리다이렉트 (직접 연결 x)",
    description:
      "구글 로그인을 성공했을 때 자동으로 리다이렉트하여 실행되는 api",
  })
  async googleRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CommonApiResponse<SafeCustomer | SafeMover>> {
    let userInfo:
      | CustomerGoogleOauthLoginResponseDto
      | MoverGoogleOauthLoginResponseDto;
    //req.user의 role에 따라 분기처리 예정
    if (req.user?.role === "customer") {
      // 손님 OAuth 로그인 일 때
      userInfo = await this.customerAuthService.signUpOrSignInByOauthCustomer(
        req.user,
      );
      SetAuthCookies.set(res, userInfo.accessToken, userInfo.refreshToken);
      return CommonApiResponse.success(userInfo.customer, "로그인 완료");
    }
    if (req.user?.role === "mover") {
      // 기사 OAuth 로그인 일 때
      userInfo = await this.moverAuthService.signUpOrSignInByOauthMover(
        req.user,
      );
      SetAuthCookies.set(res, userInfo.accessToken, userInfo.refreshToken);
      return CommonApiResponse.success(userInfo.mover, "로그인 완료");
    }
    throw new BadRequestException();
  }
}
