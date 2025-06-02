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
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { JustLookUserGuard } from "src/common/guards/just-look-user.guard";
import { MoverReviewService } from "./moverReview.service";
import {
  ReviewPaginationRequestDto,
  ReviewPaginationResponseDto,
} from "src/common/dto/pagination.dto";
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
  @ApiOkResponse({
    description: "리뷰 리스트 조회에 성공하였습니다.",
    schema: {
      example: {
        success: true,
        message: "리뷰 리스트 조회에 성공하였습니다.",
        data: {
          totalPages: 2,
          currentPage: 0,
          list: [
            {
              id: "9db9a606-89aa-4e1e-922f-ff28cee880f6",
              content: "댓글 테스트",
              rating: 4,
              moverId: "1503b09e-41a3-48f7-af15-7643e8c1a38d",
              quotationId: "08a625e2-29a9-42e7-8b28-7f6174386915",
              customerId: "39d35584-a217-4f35-9575-f6ee81a9180b",
              createdAt: "2025-06-02T09:40:18.185Z",
              updatedAt: "2025-06-02T09:34:18.185Z",
            },
            // ... 생략
          ],
          ratingCounts: {
            "1": 1,
            "2": 1,
            "3": 1,
            "4": 3,
            "5": 1,
          },
        },
      },
    },
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

    return CommonApiResponse.success(
      result,
      "리뷰 리스트 조회에 성공하였습니다.",
    );
  }
}
