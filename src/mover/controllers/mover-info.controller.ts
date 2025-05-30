import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { MoverInfoService } from "../services/mover-info.service";
import { MoverListRequestDto } from "../dto/mover-list.request.dto";
import { JustLookUserGuard } from "src/common/guards/just-look-user.guard";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CommonApiResponse } from "src/common/dto/api-response.dto";
import { InfiniteScrollResponseDto } from "src/common/dto/infinite-scroll.dto";
import { FindMoverData } from "../dto/mover-list.response.dto";

@ApiTags("Mover")
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
                  isProfile: { type: "boolean", example: true },
                  isLiked: { type: "boolean", example: false },
                  isAssigned: { type: "boolean", example: false },
                  career: { type: "number", example: 16 },
                  intro: { type: "string", nullable: true, example: null },
                  confirmedCounts: { type: "number", example: 0 },
                  reviewCounts: { type: "number", example: 0 },
                  likeCount: { type: "number", example: 2 },
                  totalRating: { type: "number", example: 0 },
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
}
