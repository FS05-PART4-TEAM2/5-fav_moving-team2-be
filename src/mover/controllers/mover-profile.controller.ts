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

@Controller("mover-profile")
export class MoverProfileController {
  constructor(private readonly moverProfileService: MoverProfileService) {}

  @Put("")
  @ApiBearerAuth("access-token")
  @UseInterceptors(FileInterceptor("profileImage")) // multer가 'profileImg' 필드 파싱
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
      required: ["profileImg", "wantService", "livingPlace"],
    },
  })
  @ApiOperation({ summary: "기사님 프로필 등록/수정" })
  @UseGuards(JwtCookieAuthGuard)
  async signUpCustomer(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    request: {
      nickname: string;
      career: number;
      intro: string;
      detailDescription: string;
      wantService: string;
      livingPlace: string;
    },
  ): Promise<CommonApiResponse<null>> {
    const userId = req.user.userId as string;

    const profile = await this.moverProfileService.modify(userId, {
      file,
      nickname,
      career,
      intro,
      detailDescription,
      wantService: request.wantService.split(",") as ServiceTypeKey[],
      livingPlace: request.livingPlace.split(",") as RegionKey[],
    });

    return CommonApiResponse.success(profile, "프로필 등록이 완료되었습니다.");
  }
}
