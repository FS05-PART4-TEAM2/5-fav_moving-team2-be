import {
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtCookieAuthGuard } from "src/common/guards/jwt-cookie-auth.guard";
import { likeMoverService } from "./likeMover.service";
import { LikeMover } from "./likeMover.entity";
import { CommonApiResponse } from "src/common/dto/api-response.dto";

@ApiTags("Like")
@ApiBearerAuth("access-token")
@Controller("api/like")
export class LikeMoverController {
  constructor(private readonly likeMoverService: likeMoverService) {}

  @Post(":id/customer")
  @ApiOperation({
    summary: "기사 찜하기",
    description: "손님이 원하는 기사를 찜해놓습니다.",
  })
  @ApiParam({
    name: "id",
    type: String,
    required: true,
    description: "찜할 기사 ID",
  })
  @ApiResponse({
    status: 201,
    description: "기사 찜하기 성공",
    schema: {
      type: "object",
      example: {
        success: true,
        data: {
          id: "80b89c9b-0215-4be0-9f6a-301770606669",
          moverId: "1503b09e-41a3-48f7-af15-7643e8c1a38d",
          customerId: "a19d165c-4255-4e58-84aa-d574c565895f",
        },
        message: "기사 찜하기 성공",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "이미 찜한 기사일 때",
    schema: {
      example: {
        success: false,
        data: null,
        message: "이미 찜한 기사입니다.",
        errorCode: "BadRequestException",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "기사 계정으로 로그인 했을 때",
    schema: {
      example: {
        success: false,
        data: null,
        message: "기사 계정으로 할 수 없는 기능입니다.",
        errorCode: "UnauthorizedException",
      },
    },
  })
  @UseGuards(JwtCookieAuthGuard)
  async postLikeMoverByCustomer(
    @Req() req,
    @Param("id", ParseUUIDPipe) moverId: string,
  ): Promise<CommonApiResponse<LikeMover>> {
    const { userId, userType } = req.user ?? {};
    const result = await this.likeMoverService.postLikeMoverByCustomer(
      userId,
      userType,
      moverId,
    );

    return CommonApiResponse.success(result, "기사 찜하기 성공");
  }
}
