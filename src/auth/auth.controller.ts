import { Controller, Get, Param, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
import { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
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

  @Get("google/login")
  @UseGuards(AuthGuard("google"))
  googleLogin() {
    // 실제 실행되지 않는 핸들러. guard가 구글 로그인 페이지로 자동 리디렉션만 진행
  }

  @Get("google/redirect")
  @UseGuards(AuthGuard("google"))
  googleRedirect(@Req() req: Request) {
    //req.user의 role에 따라 분기처리 예정
    console.log(req.user);
  }
}
