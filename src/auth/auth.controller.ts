import { Controller, Get, Param, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
import { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";

@Controller("api/auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
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
  googleRedirect(@Req() req: Request) {
    //req.user의 role에 따라 분기처리 예정
    console.log(req.user);
  }
}
