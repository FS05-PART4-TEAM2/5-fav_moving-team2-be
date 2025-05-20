import { Body, Controller, Post, Res } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { ApiResponse } from "src/common/dto/api-response.dto";
import { Mover } from "../mover.entity";
import { SignUpRequestDto } from "src/common/dto/signup.request.dto";

@ApiTags("Auth")
@Controller("auth/mover")
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
}
