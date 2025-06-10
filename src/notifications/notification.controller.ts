// src/notifications/notification.controller.ts
import { Controller, UseGuards } from "@nestjs/common";
import { JwtCookieAuthGuard } from "src/common/guards/jwt-cookie-auth.guard";
import { NotificationService } from "./notification.service";

@Controller("api/notifications")
@UseGuards(JwtCookieAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * @TODO 내 알림 목록 조회: GET /api/notifications
   * 1. 인증
   * 2. 무한 스크롤
   */

  /**
   * @TODO 특정 알림을 읽음 처리: PATCH /api/notifications/:id/read
   */
}
