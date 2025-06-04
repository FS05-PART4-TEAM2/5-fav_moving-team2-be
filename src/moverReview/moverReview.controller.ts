import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { JustLookUserGuard } from "src/common/guards/just-look-user.guard";
import { MoverReviewService } from "./moverReview.service";
import {
  ReviewPaginationRequestDto,
  ReviewPaginationResponseDto,
} from "src/common/dto/pagination.dto";
import { CommonApiResponse } from "src/common/dto/api-response.dto";
import { JwtCookieAuthGuard } from "src/common/guards/jwt-cookie-auth.guard";
import { C } from "@faker-js/faker/dist/airline-BUL6NtOJ";
import { CreateMoverReviewDto } from "./dto/createReview.request.dto";
import { create } from "domain";

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
        data: {
          totalPages: 2,
          list: [
            {
              id: "9db9a606-89aa-4e1e-922f-ff28cee880f6",
              content: "댓글 테스트",
              rating: 4,
              moverId: "1503b09e-41a3-48f7-af15-7643e8c1a38d",
              quotationId: "08a625e2-29a9-42e7-8b28-7f6174386915",
              customerId: "39d35584-a217-4f35-9575-f6ee81a9180b",
              customerNick: "익명",
              createdAt: "2025-06-02T09:40:18.185Z",
              updatedAt: "2025-06-02T09:34:18.185Z",
            },
            {
              id: "9db9a606-89aa-4e1e-922f-ff28cee880f7",
              content: "댓글 테스트",
              rating: 4,
              moverId: "1503b09e-41a3-48f7-af15-7643e8c1a38d",
              quotationId: "08a625e2-29a9-42e7-8b28-7f6174386915",
              customerId: "39d35584-a217-4f35-9575-f6ee81a9180b",
              customerNick: "익명",
              createdAt: "2025-06-02T09:39:18.185Z",
              updatedAt: "2025-06-02T09:34:18.185Z",
            },
            {
              id: "9db9a606-89aa-4e1e-922f-ff28cee880f9",
              content: "댓글 테스트",
              rating: 1,
              moverId: "1503b09e-41a3-48f7-af15-7643e8c1a38d",
              quotationId: "08a625e2-29a9-42e7-8b28-7f6174386915",
              customerId: "39d35584-a217-4f35-9575-f6ee81a9180b",
              customerNick: "익명",
              createdAt: "2025-06-02T09:38:18.185Z",
              updatedAt: "2025-06-02T09:34:18.185Z",
            },
            {
              id: "9db9a606-89aa-4e1e-922f-ff28cee880f1",
              content: "댓글 테스트",
              rating: 2,
              moverId: "1503b09e-41a3-48f7-af15-7643e8c1a38d",
              quotationId: "08a625e2-29a9-42e7-8b28-7f6174386915",
              customerId: "39d35584-a217-4f35-9575-f6ee81a9180b",
              customerNick: "익명",
              createdAt: "2025-06-02T09:37:18.185Z",
              updatedAt: "2025-06-02T09:34:18.185Z",
            },
            {
              id: "9db9a606-89aa-4e1e-922f-ff28cee880f2",
              content: "댓글 테스트",
              rating: 3,
              moverId: "1503b09e-41a3-48f7-af15-7643e8c1a38d",
              quotationId: "08a625e2-29a9-42e7-8b28-7f6174386915",
              customerId: "39d35584-a217-4f35-9575-f6ee81a9180b",
              customerNick: "익명",
              createdAt: "2025-06-02T09:36:18.185Z",
              updatedAt: "2025-06-02T09:34:18.185Z",
            },
          ],
          currentPage: 1,
          ratingCounts: {
            "1": 2,
            "2": 1,
            "3": 1,
            "4": 4,
            "5": 1,
          },
          ratingPercentages: {
            "1": 22.2,
            "2": 11.1,
            "3": 11.1,
            "4": 44.4,
            "5": 11.2,
          },
          totalRating: 2.2,
        },
        message: "리뷰 리스트 조회에 성공하였습니다.",
      },
    },
  })
  @ApiParam({
    name: "id",
    type: String,
    required: true,
    description: "리뷰를 조회할 기사의 ID",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "페이지 당 리뷰 개수 (기본 5)",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "페이지 번호 (1부터 시작)",
  })
  @UseGuards(JustLookUserGuard)
  async getMoverReviewList(
    @Req() req,
    @Param("id", ParseUUIDPipe) moverId: string,
    @Query() getMoverReviewListDto: ReviewPaginationRequestDto,
  ): Promise<CommonApiResponse<ReviewPaginationResponseDto>> {
    const { userId, userType } = req.user;
    const result = await this.moverReviewService.getMoverReviewList(
      userId,
      userType,
      moverId,
      getMoverReviewListDto.page,
      getMoverReviewListDto.limit,
    );

    return CommonApiResponse.success(
      result,
      "리뷰 리스트 조회에 성공하였습니다.",
    );
  }

  /* 테스트 전용 리뷰 생성 API */
  @Post("test")
  @UseGuards(JwtCookieAuthGuard)
  async createTestReviews() {
    if (process.env.NODE_ENV === "production") {
      throw new ForbiddenException("운영 환경에서는 사용할 수 없는 API입니다.");
    }

    const result = await this.moverReviewService.createSingleDummyReview();

    return {
      success: true,
      message: `테스트 리뷰가 생성 되었습니다.`,
      data: result,
    };
  }

  @Post(":offerId")
  @ApiOperation({ summary: "일반유저 : 기사 리뷰 작성 " })
  @UseGuards(JwtCookieAuthGuard)
  async createMoverReview(
    @Body() body: CreateMoverReviewDto,
    @Req() req,
    @Param("offerId") offerId: string,
  ): Promise<CommonApiResponse<any>> {
    const { userId, userType } = req.user;

    if (userType !== "customer") {
      throw new ForbiddenException("일반유저만 접근할 수 있는 API입니다.");
    }

    const createMoverReviewDto: CreateMoverReviewDto = {
      offerId: offerId,
      userId: userId,
      content: body.content,
      rating: body.rating,
    };

    const result =
      await this.moverReviewService.createMoverReview(createMoverReviewDto);

    return CommonApiResponse.success(result, "리뷰 작성에 성공하였습니다.");
  }
}
