import { Body, Controller, Post } from "@nestjs/common";
import { CustomerProfileService } from "../services/customer-profile.service";
import { ApiOperation } from "@nestjs/swagger";
import { ApiResponse } from "src/common/dto/api-response.dto";
import { CustomerProfileRequestDto } from "../dto/customer-profile.request.dto";

@Controller("api/profile/customer")
export class CustomerProfileController {
  constructor(
    private readonly customerProfileService: CustomerProfileService,
  ) {}

  @Post("")
  @ApiOperation({ summary: "소비자 프로필 등록" })
  async signUpCustomer(
    @Body() createCustomerProfile: CustomerProfileRequestDto,
  ): Promise<ApiResponse<null>> {
    await this.customerProfileService.create(createCustomerProfile);
    return ApiResponse.success(null, "프로필 등록이 완료되었습니다.");
  }
}
