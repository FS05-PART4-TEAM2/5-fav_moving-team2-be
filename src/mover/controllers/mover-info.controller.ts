import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { MoverInfoService } from "../services/mover-info.service";
import { MoverListRequestDto } from "../dto/mover-list.request.dto";
import { JustLookUserGuard } from "src/common/guards/just-look-user.guard";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CommonApiResponse } from "src/common/dto/api-response.dto";
import { InfiniteScrollResponseDto } from "src/common/dto/infinite-scroll.dto";
import { FindMoverData } from "../dto/mover-list.response.dto";
import { MoverDetailResponseDto } from "../dto/mover-detail.response.dto";

@ApiTags("Mover")
@ApiBearerAuth("access-token")
@Controller("api/mover")
export class MoverInfoController {
  constructor(private readonly moverInfoService: MoverInfoService) {}

  @Get()
  @ApiOperation({
    summary: "기사 리스트 조회",
    description: "기사 리스트를 조회합니다.",
  })
  @ApiResponse({
    status: 200,
    description: "기사 리스트 조회 성공",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        data: {
          type: "object",
          properties: {
            list: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    format: "uuid",
                    example: "f4ef9ae8-777b-49fa-80bc-5b3a13226780",
                  },
                  idNum: { type: "number", example: 14 },
                  nickname: { type: "string", nullable: true, example: null },
                  profileImage: {
                    type: "string",
                    example: "http://image.com/img",
                  },
                  isLiked: { type: "boolean", example: false },
                  isAssigned: { type: "boolean", example: false },
                  career: { type: "number", example: 16 },
                  intro: { type: "string", nullable: true, example: null },
                  confirmedCounts: { type: "number", example: 0 },
                  reviewCounts: { type: "number", example: 0 },
                  likeCount: { type: "number", example: 2 },
                  totalRating: { type: "number", example: 0 },
                  serviceList: { type: "Array", example: ["SMALL_MOVE"] },
                },
              },
            },
            orderNextCursor: { type: "number", example: 5 },
            idNumNextCursor: { type: "number", example: 5 },
            hasNext: { type: "boolean", example: true },
          },
        },
        message: { type: "string", example: "기사 리스트 조회 성공" },
      },
    },
  })
  @UseGuards(JustLookUserGuard)
  async getMoverList(
    @Req() req,
    @Query() moverListRequestDto: MoverListRequestDto,
  ): Promise<CommonApiResponse<InfiniteScrollResponseDto<FindMoverData>>> {
    const { userId, userType } = req.user ?? {};
    const result = await this.moverInfoService.getMoverList(
      moverListRequestDto,
      userId,
      userType,
    );

    return CommonApiResponse.success(result, "기사 리스트 조회 성공");
  }

  @Get(":id")
  @ApiOperation({
    summary: "기사 상세 정보 조회",
    description: "기사 상세 정보를 조회합니다.",
  })
  @ApiParam({
    name: "id",
    type: String,
    required: true,
    description: "조회할 기사 ID",
  })
  @ApiResponse({
    status: 200,
    description: "기사 상세 정보 조회 성공",
    schema: {
      type: "object",
      example: {
        success: true,
        data: {
          id: "1503b09e-41a3-48f7-af15-7643e8c1a38d",
          idNum: 13,
          detailDescription: null,
          nickname: null,
          isLiked: false,
          isAssigned: false,
          profileImage:
            "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg",
          career: 1,
          intro: null,
          confirmedCounts: 0,
          reviewCounts: 55,
          totalRating: 2.2,
          serviceArea: ["SEOUL"],
          serviceList: ["SMALL_MOVE"],
          likeCount: 7,
        },
        message: "기사 상세 조회 성공",
      },
    },
  })
  @ApiNotFoundResponse({ description: "해당 ID의 기사를 찾을 수 없습니다." })
  @ApiBadRequestResponse({ description: "프로필을 등록하지 않은 기사입니다." })
  @UseGuards(JustLookUserGuard)
  async getMoverDetail(
    @Req() req,
    @Param("id", ParseUUIDPipe) moverId: string,
  ): Promise<CommonApiResponse<MoverDetailResponseDto>> {
    const { userId, userType } = req.user ?? {};
    const result = await this.moverInfoService.getMoverDetail(
      userId,
      userType,
      moverId,
    );
    return CommonApiResponse.success(result, "기사 상세 조회 성공");
  }
}
