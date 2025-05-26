import {
  Body,
  Controller,
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
import {
  SERVICE_TYPES,
  ServiceTypeKey,
} from "src/common/constants/service-type.constant";
import { RegionKey, REGIONS } from "src/common/constants/region.constant";
import { MoverProfileResponseDto } from "../dto/customer-profile.response.dto";

@Controller("mover-profile")
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
        profileImg: {
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
          type: "array",
          items: {
            type: "string",
            enum: SERVICE_TYPES.map((s) => s.key),
          },
          example: ["SMALL_MOVE", "BIG_MOVE"],
        },
        serviceArea: {
          type: "array",
          items: {
            type: "string",
            enum: REGIONS.map((r) => r.key),
          },
          example: ["SEOUL", "BUSAN"],
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

    const profile = await this.moverProfileService.modify(userId, {
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
}
