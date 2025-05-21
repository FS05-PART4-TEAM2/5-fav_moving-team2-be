import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { SignUpRequestDto } from "src/common/dto/signup.request.dto";
import { ApiResponse } from "src/common/dto/api-response.dto";
import { Customer } from "../customer.entity";
import { CustomerAuthService } from "./auth.service";

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
}
