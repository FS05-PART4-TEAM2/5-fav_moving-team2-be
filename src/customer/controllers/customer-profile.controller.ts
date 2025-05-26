import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { CustomerProfileService } from "../services/customer-profile.service";
import { ApiBody, ApiConsumes, ApiOperation } from "@nestjs/swagger";
import { ApiResponse } from "src/common/dto/api-response.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  SERVICE_TYPES,
  ServiceTypeKey,
} from "src/common/constants/service-type.constant";
import { RegionKey, REGIONS } from "src/common/constants/region.constant";
import { JwtCookieAuthGuard } from "src/common/guards/jwt-cookie-auth.guard";

@Controller("api/profile/customer")
export class CustomerProfileController {
  constructor(
    private readonly customerProfileService: CustomerProfileService,
  ) {}

  @Post("")
  @ApiBearerAuth("access-token")
  @UseInterceptors(FileInterceptor("profileImg")) // multer가 'profileImg' 필드 파싱
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        profileImg: {
          type: "string",
          format: "binary",
          description: "업로드할 이미지 파일",
        },
        wantService: {
          type: "string",
          enum: SERVICE_TYPES.map((s) => s.key),
          example: "SMALL_MOVE",
        },
        livingPlace: {
          type: "string",
          enum: REGIONS.map((r) => r.key),
          example: "SEOUL",
        },
      },
      required: ["profileImg", "wantService", "livingPlace"],
    },
  })
  @ApiOperation({ summary: "소비자 프로필 등록" })
  @UseGuards(JwtCookieAuthGuard)
  async signUpCustomer(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    request: {
      wantService: ServiceTypeKey;
      livingPlace: RegionKey;
    },
  ): Promise<ApiResponse<null>> {
    await this.customerProfileService.create({
      file,
      wantService: request.wantService,
      livingPlace: request.livingPlace,
    });
    return ApiResponse.success(null, "프로필 등록이 완료되었습니다.");
  }
}
