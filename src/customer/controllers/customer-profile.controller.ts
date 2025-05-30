import {
  Body,
  Controller,
  Get,
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
import { FileInterceptor } from "@nestjs/platform-express";
import { ServiceTypeKey } from "src/common/constants/service-type.constant";
import { RegionKey } from "src/common/constants/region.constant";
import { JwtCookieAuthGuard } from "src/common/guards/jwt-cookie-auth.guard";
import { CommonApiResponse } from "src/common/dto/api-response.dto";
import { CustomerProfileResponseDto } from "../dto/customer-profile.response.dto";
import { CustomerProfileRequestDto } from "../dto/customer-profile.request.dto";

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
        username: {
          type: "string",
          description: "사용자 이름 (선택)",
          example: "john_doe",
          nullable: true,
        },
        currPassword: {
          type: "string",
          description: "현재 비밀번호 (비밀번호 변경 시 필요)",
          example: "current123!",
          nullable: true,
        },
        newPassword: {
          type: "string",
          description: "새 비밀번호 (비밀번호 변경 시 필요)",
          example: "newSecurePassword!",
          nullable: true,
        },
        phoneNumber: {
          type: "string",
          description: "전화번호",
          example: "101-0000-0000",
        },
        wantService: {
          type: "string",
          description: "원하는 서비스 (문자열, 쉼표로 구분)",
          example: "SMALL_MOVE,BIG_MOVE",
        },
        livingPlace: {
          type: "string",
          description: "사는 지역 (문자열, 쉼표로 구분)",
          example: "SEOUL,BUSAN",
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
    request: CustomerProfileRequestDto,
  ): Promise<CommonApiResponse<CustomerProfileResponseDto>> {
    const userId = req.user.userId as string;
    const { wantService, livingPlace, ...rest } = request;

    const profile = await this.customerProfileService.create(userId, {
      file,
      wantService: wantService.split(",") as ServiceTypeKey[],
      livingPlace: livingPlace.split(",") as RegionKey[],
      ...rest,
    });
    return CommonApiResponse.success(profile, "프로필 등록이 완료되었습니다.");
  }

  @Get("")
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "소비자 프로필 조회" })
  @UseGuards(JwtCookieAuthGuard)
  async getProfile(
    @Req() req,
  ): Promise<CommonApiResponse<CustomerProfileResponseDto>> {
    const userId = req.user.userId as string;

    const profile = await this.customerProfileService.getProfile(userId);

    return CommonApiResponse.success(profile, "프로필 조회에 성공하였습니다.");
  }
}
