import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { SignUpRequestDto } from "src/common/dto/signup.request.dto";
import { ApiResponse } from "src/common/dto/api-response.dto";
import { Customer } from "../customer.entity";
import { LoginRequestDto } from "src/common/dto/login.request.dto";
import { LoginResponseDto } from "src/common/dto/login.response.dto";

@ApiTags("Auth")
@Controller("auth/customer")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  @ApiOperation({ summary: "소비자 회원가입" })
  async signUpCustomer(
    @Body() createCustomerDto: SignUpRequestDto,
  ): Promise<ApiResponse<Customer | null>> {
    const customer = await this.authService.signUp(createCustomerDto);
    return ApiResponse.success(customer, "회원가입이 완료되었습니다.");
  }

  @Post("login")
  @ApiOperation({ summary: "소비자 로그인" })
  async loginCustomer(
    @Body() LoginRequestDto: LoginRequestDto,
  ): Promise<ApiResponse<LoginResponseDto>> {
    const loginResponse = await this.authService.login(LoginRequestDto);
    return ApiResponse.success(loginResponse, "로그인 완료");
  }
}
