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
import { MoverProfileService } from "../services/mover-profile.service";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtCookieAuthGuard } from "src/common/guards/jwt-cookie-auth.guard";
import { CommonApiResponse } from "src/common/dto/api-response.dto";
import { ServiceTypeKey } from "src/common/constants/service-type.constant";
import { RegionKey } from "src/common/constants/region.constant";
import { MoverProfileResponseDto } from "../dto/mover-profile.response.dto";

@Controller("api/profile/mover")
export class MoverProfileController {
  constructor(private readonly moverProfileService: MoverProfileService) {}

  @Put("")
  @ApiBearerAuth("access-token")
  @UseInterceptors(FileInterceptor("profileImage"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        profileImage: {
          type: "string",
          format: "binary",
          description: "업로드할 이미지 파일",
        },
        nickname: {
          type: "string",
          description: "기사 닉네임",
          example: "빠른이사맨",
        },
        career: {
          type: "string",
          description: "경력 (단위: 년)",
          example: 5,
        },
        intro: {
          type: "string",
          description: "한 줄 소개",
          example: "친절하고 빠른 이사 도와드려요!",
        },
        detailDescription: {
          type: "string",
          description: "상세 소개",
          example:
            "서울 전 지역 이사 전문입니다. 꼼꼼한 포장과 빠른 작업 보장합니다.",
        },
        serviceList: {
          type: "string",
          description: "원하는 서비스 (문자열, 쉼표로 구분)",
          example: "SMALL_MOVE,BIG_MOVE",
        },
        serviceArea: {
          type: "string",
          description: "사는 지역 (문자열, 쉼표로 구분)",
          example: "SEOUL,BUSAN",
        },
      },
      required: [
        "nickname",
        "career",
        "intro",
        "detailDescription",
        "serviceList",
        "serviceArea",
      ],
    },
  })
  @ApiOperation({ summary: "기사님 프로필 등록/수정" })
  @UseGuards(JwtCookieAuthGuard)
  async signUpCustomer(
    @Req() req,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body()
    request: {
      nickname: string;
      career: string;
      intro: string;
      detailDescription: string;
      serviceList: string;
      serviceArea: string;
    },
  ): Promise<CommonApiResponse<MoverProfileResponseDto>> {
    const userId = req.user.userId as string;

    const profile = await this.moverProfileService.modifyProfile(userId, {
      file,
      nickname: request.nickname,
      career: request.career,
      intro: request.intro,
      detailDescription: request.detailDescription,
      serviceList: request.serviceList.split(",") as ServiceTypeKey[],
      serviceArea: request.serviceArea.split(",") as RegionKey[],
    });

    return CommonApiResponse.success(profile, "프로필 등록이 완료되었습니다.");
  }

  @Put("info")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtCookieAuthGuard)
  @ApiOperation({
    summary: "기사님 기본 정보 수정 (이름/이메일/전화번호/비밀번호)",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        username: {
          type: "string",
          example: "movehero21",
          description: "아이디",
        },
        email: {
          type: "string",
          example: "movehero@example.com",
          description: "이메일",
        },
        phoneNumber: {
          type: "string",
          example: "101-0000-0000",
          description: "전화번호",
        },
        currPassword: {
          type: "string",
          example: "currentPassword123!",
          description: "현재 비밀번호",
        },
        newPassword: {
          type: "string",
          example: "newSecurePassword!9",
          description: "새 비밀번호",
        },
      },
      required: ["username", "email", "phoneNumber"],
    },
  })
  async updateInfo(
    @Req() req,
    @Body()
    request: {
      username: string;
      email: string;
      phoneNumber: string;
      currPassword: string;
      newPassword: string;
    },
  ): Promise<CommonApiResponse<MoverProfileResponseDto>> {
    const userId = req.user.userId as string;

    const updated = await this.moverProfileService.modifyInfo(userId, request);

    return CommonApiResponse.success(updated, "기본 정보가 수정되었습니다.");
  }

  /** */
  @Get("")
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "기사님 프로필 조회" })
  @UseGuards(JwtCookieAuthGuard)
  async getProfile(
    @Req() req,
  ): Promise<CommonApiResponse<MoverProfileResponseDto>> {
    const userId = req.user.userId as string;

    const profile = await this.moverProfileService.getProfile(userId);

    return CommonApiResponse.success(profile, "프로필 조회에 성공하였습니다.");
  }
}
