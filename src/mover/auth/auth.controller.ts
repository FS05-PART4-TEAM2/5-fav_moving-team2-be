import { Body, Controller, Post, Res } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { ApiResponse } from "src/common/dto/api-response.dto";
import { Mover } from "../mover.entity";
import { SignUpRequestDto } from "src/common/dto/signup.request.dto";
import { LoginRequestDto } from "src/common/dto/login.request.dto";
import { MoverLoginResponseDto } from "src/common/dto/login.response.dto";
import { Response } from "express";

@ApiTags("Auth")
@Controller("api/auth/mover")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  @ApiOperation({ summary: "회원가입" })
  async signUpMover(
    @Body() createMoverDto: SignUpRequestDto,
  ): Promise<ApiResponse<Mover | null>> {
    const mover = await this.authService.signUp(createMoverDto);
    return ApiResponse.success(mover, "회원가입 성공");
  }

  @Post("login")
  @ApiOperation({ summary: "로그인" })
  async loginMover(
    @Body() LoginRequestDto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<MoverLoginResponseDto>> {
    const loginResponse = await this.authService.login(LoginRequestDto);
    res.cookie("accessToken", loginResponse.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.cookie("refreshToken", loginResponse.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return ApiResponse.success(loginResponse, "로그인 성공");
  }
}
