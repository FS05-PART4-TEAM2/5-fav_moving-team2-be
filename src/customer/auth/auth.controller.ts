import { Body, Controller, Post, Res } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { SignUpRequestDto } from "src/common/dto/signup.request.dto";
import { ApiResponse } from "src/common/dto/api-response.dto";
import { Customer } from "../customer.entity";
import { CustomerAuthService } from "./auth.service";
import { LoginRequestDto } from "src/common/dto/login.request.dto";
import { CustomerLoginResponseDto } from "src/common/dto/login.response.dto";
import { Response } from "express";

@ApiTags("Auth")
@Controller("auth/customer")
export class CustomerAuthController {
  constructor(private readonly authService: CustomerAuthService) {}

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
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<CustomerLoginResponseDto>> {
    const loginResponse = await this.authService.login(LoginRequestDto);
    res.cookie("accessToken", loginResponse.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return ApiResponse.success(loginResponse, "로그인 완료");
  }
}
