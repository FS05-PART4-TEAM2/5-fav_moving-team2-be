import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { JustLookUserGuard } from "src/common/guards/just-look-user.guard";
import { MoverReviewService } from "./moverReview.service";
import { ReviewPaginationRequestDto, ReviewPaginationResponseDto } from "src/common/dto/pagination.dto";
import { CommonApiResponse } from "src/common/dto/api-response.dto";

@ApiTags("MoverReview")
@ApiBearerAuth("access-token")
@Controller("api/review")
export class MoverReviewController {
  constructor(private readonly moverReviewService: MoverReviewService) {}

  @Get(":id")
  @ApiOperation({
    summary: "기사 리뷰 리스트 조회",
    description: "기사가 받은 리뷰의 리스트를 확인합니다.",
  })
  @ApiParam({
    name: "id",
    type: String,
    required: true,
    description: "리뷰를 조회할 기사의 ID",
  })
  @UseGuards(JustLookUserGuard)
  async getMoverReviewList(
    @Req() req,
    @Param("id", ParseUUIDPipe) moverId: string,
    @Query() getMoverReviewListDto: ReviewPaginationRequestDto,
  ): Promise<CommonApiResponse<ReviewPaginationResponseDto>> {
    const { userId, userType } = req.user ?? {};
    const result = await this.moverReviewService.getMoverReviewList(
      userId,
      userType,
      moverId,
      getMoverReviewListDto.limit,
      getMoverReviewListDto.page,
    );
    
    return CommonApiResponse.success(result, "리뷰 리스트 조회에 성공하였습니다.");
  }
}
