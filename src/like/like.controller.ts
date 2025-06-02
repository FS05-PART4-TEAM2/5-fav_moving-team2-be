import {
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtCookieAuthGuard } from "src/common/guards/jwt-cookie-auth.guard";
import { likeMoverService } from "./like.service";
import { Like } from "./like.entity";
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
  @UseGuards(JwtCookieAuthGuard)
  async postLikeMoverByCustomer(
    @Req() req,
    @Param("id", ParseUUIDPipe) moverId: string,
  ): Promise<CommonApiResponse<Like>> {
    const { userId, userType } = req.user ?? {};
    const result = await this.likeMoverService.postLikeMoverByCustomer(
      userId,
      userType,
      moverId,
    );

    return CommonApiResponse.success(result, "기사 찜하기 성공");
  }
}
