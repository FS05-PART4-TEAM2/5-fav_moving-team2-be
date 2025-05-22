import { Body, Controller, Post, Res } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiResponse } from "src/common/dto/api-response.dto";
import { Mover } from "../mover.entity";
import { SignUpRequestDto } from "src/common/dto/signup.request.dto";
import { LoginRequestDto } from "src/common/dto/login.request.dto";
import { MoverLoginResponseDto } from "src/common/dto/login.response.dto";
import { Response } from "express";
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
  ): Promise<ApiResponse<Mover | null>> {
    const mover = await this.moverAuthService.signUp(createMoverDto);
    return ApiResponse.success(mover, "회원가입 성공");
  }

  @Post("login")
  @ApiOperation({ summary: "로그인" })
  async loginMover(
    @Body() LoginRequestDto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<MoverLoginResponseDto>> {
    const loginResponse = await this.moverAuthService.login(LoginRequestDto);
    console.log("loginResponse", loginResponse);
    SetAuthCookies.set(
      res,
      loginResponse.accessToken,
      loginResponse.refreshToken,
    );

    return ApiResponse.success(loginResponse, "로그인 성공");
  }
}
