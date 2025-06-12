import {
  Controller,
  Delete,
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
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtCookieAuthGuard } from "src/common/guards/jwt-cookie-auth.guard";
import { likeMoverService } from "./likeMover.service";
import { LikeMover } from "./likeMover.entity";
import { CommonApiResponse } from "src/common/dto/api-response.dto";
import {
  PaginatedScrollDto,
  PaginatedScrollResponseDto,
} from "src/common/dto/pagination.dto";
import { GetLikeMoverData } from "./dto/get-like-mover-list.response.dto";

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

  @Delete(":id/customer")
  @ApiOperation({
    summary: "기사 찜해제",
    description: "손님이 찜했던 기사에 대해 찜하기를 취소합니다.",
  })
  @ApiParam({
    name: "id",
    type: String,
    required: true,
    description: "찜해제할 기사 ID",
  })
  @ApiResponse({
    status: 200,
    description: "기사 찜해제 성공",
    schema: {
      type: "object",
      example: {
        success: true,
        data: null,
        message: "기사 찜해제 성공",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "찜하지 않은 기사일 때",
    schema: {
      example: {
        success: false,
        data: null,
        message: "찜하지 않은 기사입니다.",
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
  async deleteLikeMoverByCustomer(
    @Req() req,
    @Param("id", ParseUUIDPipe) moverId: string,
  ): Promise<CommonApiResponse<null>> {
    const { userId, userType } = req.user ?? {};
    const result = await this.likeMoverService.deleteLikeMoverByCustomer(
      userId,
      userType,
      moverId,
    );

    return CommonApiResponse.success(result, "기사 찜하기 해제");
  }

  @Get("customer")
  @ApiOperation({ summary: "손님 - 찜한 기사님 목록 조회" })
  @UseGuards(JwtCookieAuthGuard)
  @ApiOkResponse({
    description: "찜한 기사님 리스트 조회 성공",
    schema: {
      example: {
        success: true,
        data: {
          list: [
            {
              id: "1503b09e-41a3-48f7-af15-7643e8c1a38d",
              idNum: 13,
              nickName: null,
              profileImage:
                "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg",
              serviceList: "SMALL_MOVE",
              likeCount: 8,
              totalRating: 3,
              reviewCounts: 55,
              intro: null,
              career: 1,
              confirmedCounts: 0,
              isLiked: true,
              isAssigned: true,
            },
            {
              id: "78c01b52-538e-4f18-a5f9-dca27ea4214f",
              idNum: 12,
              nickName: null,
              profileImage: null,
              serviceList: null,
              likeCount: 2,
              totalRating: null,
              reviewCounts: 0,
              intro: null,
              career: 11,
              confirmedCounts: 0,
              isLiked: true,
              isAssigned: false,
            },
            {
              id: "8afcbca0-ce76-4734-b238-2a060eed1b59",
              idNum: 11,
              nickName: null,
              profileImage: null,
              serviceList: null,
              likeCount: 9,
              totalRating: null,
              reviewCounts: 0,
              intro: null,
              career: 12,
              confirmedCounts: 0,
              isLiked: true,
              isAssigned: false,
            },
          ],
          total: 3,
          page: 1,
          limit: 8,
          hasNextPage: false,
        },
        message: "찜한 기사 리스트 조회 성공",
      },
    },
  })
  async getLikeMoverList(
    @Req() req,
    @Query() paginationScrollDto: PaginatedScrollDto,
  ): Promise<CommonApiResponse<PaginatedScrollResponseDto<GetLikeMoverData>>> {
    const { userId, userType } = req.user ?? {};

    const result = await this.likeMoverService.getLikeMoverList(
      { userId, userType },
      paginationScrollDto,
    );
    return CommonApiResponse.success(result, "찜한 기사 리스트 조회 성공");
  }
}
