// src/notifications/notification.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtCookieAuthGuard } from "src/common/guards/jwt-cookie-auth.guard";
import { NotificationService } from "./notification.service";
import { CommonApiResponse } from "src/common/dto/api-response.dto";
import { PagedResponseDto } from "src/common/dto/paged.response.dto";
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from "@nestjs/swagger";
import { JustLookUserGuard } from "src/common/guards/just-look-user.guard";
import {
  NotificationTextSegment,
  NotificationType,
} from "./notification.entity";
import { NotificationResponseDto } from "./dto/notification.response.dto";
import { NotificationRequestDto } from "./dto/notification.request.dto";

@ApiExtraModels(CommonApiResponse, NotificationResponseDto)
@Controller("api/notifications")
@UseGuards(JwtCookieAuthGuard)
@ApiBearerAuth("access-token")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * @TODO 내 알림 목록 조회: GET /api/notifications
   * 1. 인증
   * 2. 무한 스크롤
   */
  @Get()
  @ApiOperation({
    summary: "알림 목록 조회",
    description: "알림 목록을 조회합니다.",
  })
  @UseGuards(JustLookUserGuard)
  @ApiOkResponse({
    description: "받은 요청(기사님) 목록 조회에 성공하였습니다.",
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonApiResponse) },
        {
          properties: {
            data: {
              allOf: [
                { $ref: getSchemaPath(PagedResponseDto) },
                {
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: getSchemaPath(NotificationResponseDto) },
                    },
                    nextCursor: {
                      type: "object",
                      properties: {
                        cursorId: { type: "string" },
                        cursorDate: { type: "string", format: "date-time" },
                      },
                      nullable: true,
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    },
  })
  async list(
    @Req() req,
    @Query() queries: NotificationRequestDto,
  ): Promise<CommonApiResponse<PagedResponseDto<NotificationResponseDto>>> {
    const userId = req.user.userId as string;
    const data = await this.notificationService.getNotifications(
      userId,
      queries,
    );

    return CommonApiResponse.success(data, "알림 조회에 성공하였습니다.");
  }

  /**
   * 특정 알림을 읽음 처리
   */
  @Patch(":id/read")
  @ApiOkResponse({
    description: "받은 요청(기사님) 목록 조회에 성공하였습니다.",
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonApiResponse) },
        {
          properties: {
            data: { type: "null", example: null },
          },
        },
      ],
    },
  })
  async markAsRead(
    @Req() req,
    @Param("id") notificationId: string,
  ): Promise<CommonApiResponse<null>> {
    const userId = req.user.userId as string;
    await this.notificationService.markAsRead(userId, notificationId);

    return CommonApiResponse.success(null, "알림 읽음 처리에 성공하였습니다.");
  }

  /**
   * 테스트용 알림 생성
   */
  @Post("/test-create")
  @ApiOperation({
    summary: "테스트용 알림 생성",
    description: "테스트용 알림 생성을 조회합니다.",
  })
  @ApiBody({
    schema: {
      type: "object",
      required: ["type", "segments"],
      properties: {
        type: {
          type: "string",
          enum: ["QUOTE_ARRIVED", "QUOTE_CONFIRMED", "MOVE_SCHEDULE"],
          description: "알림의 유형",
          example: "QUOTE_ARRIVED",
        },
        segments: {
          type: "array",
          description: "알림에 사용할 텍스트 세그먼트 배열",
          items: {
            type: "object",
            required: ["text"],
            properties: {
              text: {
                type: "string",
                description: "텍스트 조각 문자열",
                example: "안녕하세요, ",
              },
              isHighlight: {
                type: "boolean",
                description: "하이라이트 여부",
                additionalProperties: { type: "boolean" },
                example: true,
              },
            },
          },
        },
      },
    },
  })
  @UseGuards(JustLookUserGuard)
  async createNotification(
    @Req() req,
    @Body()
    request: {
      type: NotificationType;
      segments: NotificationTextSegment[];
      quotationId: string;
    },
  ) {
    const userId = req.user.userId as string;
    const data = await this.notificationService.createNotification(
      userId,
      request,
    );

    return CommonApiResponse.success(data, "알림 생성에 성공하였습니다.");
  }
}
