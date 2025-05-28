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
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
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
    examples: {
      customerLoginSuccess: {
        summary: "손님 로그인 성공",
        value: {
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
          message: "손님 로그인 완료",
        },
      },
      moverLoginSuccess: {
        summary: "기사 로그인 성공",
        value: {
          success: true,
          data: {
            id: "93f6c859-c606-4213-93a7-0fa3ff59fcc6",
            username: "동혁",
            nickname: null,
            isProfile: null,
            email: "hyuk.development@gmail.com",
            phoneNumber: "000-0000-0000",
            provider: "google",
            profileImage:
              "https://lh3.googleusercontent.com/a/ACg8ocIDnlUuGZT05pI-d9KsJO5_6ouGlbFgej4zTT1Fqh5ai_Lclrw=s96-c",
            img: null,
            serviceArea: null,
            serviceList: null,
            intro: null,
            career: null,
            detailDescription: null,
            likeCount: 0,
            totalRating: 0,
            reviewCounts: 0,
            createdAt: "2025-05-22T05:48:57.417Z",
          },
          message: "기사 로그인 완료",
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "잘못된 역할 정보일 때",
    example: {
      success: false,
      data: null,
      message: "존재하지 않는 역할 정보입니다.",
      errorCode: "UnauthorizedException",
    },
  })
  async setRoleAndRedirectGoogle(
    @Param("role") role: string,
    @Res() res: Response,
  ) {
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

  @Get("naver/:role/login")
  @ApiOperation({
    summary: "네이버 OAuth 로그인",
    description: "네이버 OAuth를 사용한 로그인을 진행합니다.",
  })
  @ApiOkResponse({
    description: "성공 시 응답 데이터",
    examples: {
      customerLoginSuccess: {
        summary: "손님 로그인 성공",
        value: {
          success: true,
          data: {
            id: "098775a4-101c-482f-bd13-4a0ccb73f869",
            username: "이동혁",
            email: "lnetwork@naver.com",
            isProfile: false,
            authType: null,
            provider: "naver",
            phoneNumber: "000-0000-0000",
            profileImage:
              "https://ssl.pstatic.net/static/pwe/address/img_profile.png",
            wantService: null,
            livingPlace: null,
            createdAt: "2025-05-23T07:27:05.972Z",
            updatedAt: "2025-05-26T02:16:52.823Z",
          },
          message: "손님 로그인 완료",
        },
      },
      moverLoginSuccess: {
        summary: "기사 로그인 성공",
        value: {
          success: true,
          data: {
            id: "dbfbe32a-3c98-432c-9622-3f48c50ca905",
            username: "이동혁",
            nickname: null,
            isProfile: false,
            email: "lnetwork@naver.com",
            phoneNumber: "000-0000-0000",
            provider: "naver",
            profileImage:
              "https://ssl.pstatic.net/static/pwe/address/img_profile.png",
            img: null,
            serviceArea: null,
            serviceList: null,
            intro: null,
            career: null,
            detailDescription: null,
            likeCount: 0,
            totalRating: 0,
            reviewCounts: 0,
            createdAt: "2025-05-23T07:39:58.238Z",
          },
          message: "기사 로그인 완료",
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "잘못된 역할 정보일 때",
    example: {
      success: false,
      data: null,
      message: "존재하지 않는 역할 정보입니다.",
      errorCode: "UnauthorizedException",
    },
  })
  async setRoleAndRedirectNaver(
    @Param("role") role: string,
    @Res() res: Response,
  ) {
    const rawState = JSON.stringify({ role });
    const base64State = Buffer.from(rawState).toString("base64"); // ✅ base64 인코딩

    const clientId = this.configService.get("NAVER_CLIENT_ID");
    const redirectUri = this.configService.get("NAVER_REDIRECT_URI");

    const redirectUrl =
      `https://nid.naver.com/oauth2.0/authorize` +
      `?response_type=code` +
      `&client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&state=${base64State}`;

    return res.redirect(redirectUrl);
  }

  @Get("kakao/:role/login")
  @ApiOperation({
    summary: "카카오 OAuth 로그인",
    description: "카카오 OAuth를 사용한 로그인을 진행합니다.",
  })
  @ApiOkResponse({
    description: "성공 시 응답 데이터",
    examples: {
      customerLoginSuccess: {
        summary: "손님 로그인 성공",
        value: {
          success: true,
          data: {
            id: "af8d1f50-8cff-4627-bb7e-6acdd2203d7c",
            username: "이동혁",
            email: "kakao@test.email",
            isProfile: false,
            authType: null,
            provider: "kakao",
            phoneNumber: "000-0000-0000",
            profileImage:
              "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg",
            wantService: null,
            livingPlace: null,
            createdAt: "2025-05-26T02:27:06.202Z",
            updatedAt: "2025-05-26T02:27:06.202Z",
          },
          message: "손님 로그인 완료",
        },
      },
      moverLoginSuccess: {
        summary: "기사 로그인 성공",
        value: {
          success: true,
          data: {
            id: "693e520a-95ef-410f-add7-f7734ace85fa",
            username: "이동혁",
            nickname: null,
            isProfile: false,
            email: "kakao@test.email",
            phoneNumber: "000-0000-0000",
            provider: "kakao",
            profileImage:
              "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg",
            img: null,
            serviceArea: null,
            serviceList: null,
            intro: null,
            career: null,
            detailDescription: null,
            likeCount: 0,
            totalRating: 0,
            reviewCounts: 0,
            createdAt: "2025-05-26T04:16:13.817Z",
          },
          message: "기사 로그인 완료",
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "잘못된 역할 정보일 때",
    example: {
      success: false,
      data: null,
      message: "존재하지 않는 역할 정보입니다.",
      errorCode: "UnauthorizedException",
    },
  })
  async setRoleAndRedirectKakao(
    @Param("role") role: string,
    @Res() res: Response,
  ) {
    const state = encodeURIComponent(JSON.stringify({ role }));
    const clientId = this.configService.get<string>("KAKAO_CLIENT_ID");
    const redirectUri = this.configService.get<string>("KAKAO_REDIRECT_URI");

    const redirectUrl =
      "https://kauth.kakao.com/oauth/authorize" +
      `?client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=code` +
      `&state=${state}`;

    return res.redirect(redirectUrl);
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
  ) {
    await this.handleOauthRedirect(req, res);
    res.redirect(
      `${this.configService.get("FRONT_URL") ?? "http://localhost:3000"}/oauth/callback`,
    );
  }

  @Get("naver/redirect")
  @UseGuards(AuthGuard("naver"))
  @ApiOperation({
    summary: "네이버 로그인 성공 시 리다이렉트 (직접 연결 x)",
    description:
      "네이버 로그인을 성공했을 때 자동으로 리다이렉트하여 실행되는 api",
  })
  async naverRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.handleOauthRedirect(req, res);
    res.redirect(
      `${this.configService.get("FRONT_URL") ?? "http://localhost:3000"}/oauth/callback`,
    );
  }

  @Get("kakao/redirect")
  @UseGuards(AuthGuard("kakao"))
  @ApiOperation({
    summary: "카카오 로그인 성공 시 리다이렉트 (직접 연결 x)",
    description:
      "카카오 로그인을 성공했을 때 자동으로 리다이렉트하여 실행되는 api",
  })
  async kakaoRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.handleOauthRedirect(req, res);
    res.redirect(
      `${this.configService.get("FRONT_URL") ?? "http://localhost:3000"}/oauth/callback`,
    );
  }

  //OauthRedirect 공통 로직 분리
  private async handleOauthRedirect(
    req: Request,
    res: Response,
  ): Promise<CommonApiResponse<SafeCustomer | SafeMover>> {
    let userInfo:
      | CustomerGoogleOauthLoginResponseDto
      | MoverGoogleOauthLoginResponseDto;

    console.log(req.user);

    if (req.user?.role === "customer") {
      userInfo = await this.customerAuthService.signUpOrSignInByOauthCustomer(
        req.user,
      );
      SetAuthCookies.set(req, res, userInfo.accessToken, userInfo.refreshToken);
      return CommonApiResponse.success(userInfo.customer, "손님 로그인 완료");
    }

    if (req.user?.role === "mover") {
      userInfo = await this.moverAuthService.signUpOrSignInByOauthMover(
        req.user,
      );
      SetAuthCookies.set(req, res, userInfo.accessToken, userInfo.refreshToken);
      return CommonApiResponse.success(userInfo.mover, "기사 로그인 완료");
    }

    throw new BadRequestException();
  }

  @Post("refresh")
  @ApiOperation({ summary: "AccessToken 갱신" })
  async refreshAccessToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CommonApiResponse<{ accessToken: string }>> {
    let refreshToken = req.headers["refresh-token"];

    if (Array.isArray(refreshToken)) {
      refreshToken = refreshToken[0];
    }

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

    // 응답 헤더에 토큰 설정
    res.setHeader("access-token", accessToken);
    res.setHeader("refresh-token", newRefreshToken);

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
}
