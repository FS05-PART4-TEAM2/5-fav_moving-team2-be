import {
  Body,
  Controller,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { CustomerProfileService } from "../services/customer-profile.service";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from "@nestjs/swagger";
import { CommonApiResponse } from "src/common/dto/api-response.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  SERVICE_TYPES,
  ServiceTypeKey,
} from "src/common/constants/service-type.constant";
import { RegionKey, REGIONS } from "src/common/constants/region.constant";
import { JwtCookieAuthGuard } from "src/common/guards/jwt-cookie-auth.guard";
import { CustomerProfileResponseDto } from "../dto/customer-profile.response.dto";

@Controller("api/profile/customer")
export class CustomerProfileController {
  constructor(
    private readonly customerProfileService: CustomerProfileService,
  ) {}

  @Put("")
  @ApiBearerAuth("access-token")
  @UseInterceptors(FileInterceptor("profileImage")) // multer가 'profileImg' 필드 파싱
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        profileImage: {
          type: "string",
          format: "binary",
          description: "업로드할 이미지 파일 (선택)",
        },
        wantService: {
          type: "array",
          items: {
            type: "string",
            enum: SERVICE_TYPES.map((s) => s.key),
          },
          example: ["SMALL_MOVE", "BIG_MOVE"],
        },
        livingPlace: {
          type: "array",
          items: {
            type: "string",
            enum: REGIONS.map((r) => r.key),
          },
          example: ["SEOUL", "BUSAN"],
        },
      },
      required: ["wantService", "livingPlace"],
    },
  })
  @ApiOperation({ summary: "소비자 프로필 등록/수정" })
  @UseGuards(JwtCookieAuthGuard)
  async signUpCustomer(
    @Req() req,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body()
    request: {
      wantService: string;
      livingPlace: string;
    },
  ): Promise<CommonApiResponse<CustomerProfileResponseDto>> {
    const userId = req.user.userId as string;

    const profile = await this.customerProfileService.create(userId, {
      file,
      wantService: request.wantService.split(",") as ServiceTypeKey[],
      livingPlace: request.livingPlace.split(",") as RegionKey[],
    });

    return CommonApiResponse.success(profile, "프로필 등록이 완료되었습니다.");
  }
}
