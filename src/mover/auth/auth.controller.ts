import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CommonApiResponse } from "src/common/dto/api-response.dto";
import { Mover } from "../mover.entity";
import { SignUpRequestDto } from "src/common/dto/signup.request.dto";
import { LoginRequestDto } from "src/common/dto/login.request.dto";
import { MoverLoginResponseDto } from "src/common/dto/login.response.dto";
import { Request, Response } from "express";
import { SetAuthCookies } from "src/common/utils/set-auth-cookies.util";
import { MoverAuthService } from "./auth.service";

@ApiTags("Auth")
@Controller("api/auth/mover")
export class MoverAuthController {
  constructor(private readonly moverAuthService: MoverAuthService) {}

  @Post("signup")
  @ApiOperation({ summary: "회원가입" })
  async signUpMover(
    @Body() createMoverDto: SignUpRequestDto,
  ): Promise<CommonApiResponse<Mover | null>> {
    const mover = await this.moverAuthService.signUp(createMoverDto);
    return CommonApiResponse.success(mover, "회원가입 성공");
  }

  @Post("login")
  @ApiOperation({ summary: "로그인" })
  async loginMover(
    @Body() LoginRequestDto: LoginRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CommonApiResponse<MoverLoginResponseDto>> {
    const loginResponse = await this.moverAuthService.login(LoginRequestDto);
    SetAuthCookies.set(
      req,
      res,
      loginResponse.accessToken,
      loginResponse.refreshToken,
    );

    return CommonApiResponse.success(loginResponse, "로그인 성공");
  }
}
