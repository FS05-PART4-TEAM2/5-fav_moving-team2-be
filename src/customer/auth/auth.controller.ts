import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { SignUpRequestDto } from "src/common/dto/signup.request.dto";
import { CommonApiResponse } from "src/common/dto/api-response.dto";
import { Customer } from "../customer.entity";
import { CustomerAuthService } from "./auth.service";
import { LoginRequestDto } from "src/common/dto/login.request.dto";
import { CustomerLoginResponseDto } from "src/common/dto/login.response.dto";
import { Response } from "express";
import { SetAuthCookies } from "src/common/utils/set-auth-cookies.util";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "src/auth/auth.service";

@ApiTags("Auth")
@Controller("api/auth/customer")
export class CustomerAuthController {
  constructor(
    private readonly authService: CustomerAuthService,
    private readonly sharedAuthService: AuthService,
  ) {}

  @Post("signup")
  @ApiOperation({ summary: "소비자 회원가입" })
  async signUpCustomer(
    @Body() createCustomerDto: SignUpRequestDto,
  ): Promise<CommonApiResponse<Customer | null>> {
    const customer = await this.authService.signUp(createCustomerDto);
    return CommonApiResponse.success(customer, "회원가입이 완료되었습니다.");
  }

  @Post("login")
  @ApiOperation({ summary: "소비자 로그인" })
  async loginCustomer(
    @Body() LoginRequestDto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CommonApiResponse<CustomerLoginResponseDto>> {
    const loginResponse = await this.authService.login(LoginRequestDto);
    SetAuthCookies.set(
      res,
      loginResponse.accessToken,
      loginResponse.refreshToken,
    );

    return CommonApiResponse.success(loginResponse, "로그인 완료");
  }
}
