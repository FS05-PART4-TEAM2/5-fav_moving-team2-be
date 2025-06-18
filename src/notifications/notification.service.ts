// src/notification/notification.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  Notifications,
  NotificationTextSegment,
  NotificationType,
} from "./notification.entity";
import { CursorDto, PagedResponseDto } from "src/common/dto/paged.response.dto";
import { NotificationRequestDto } from "./dto/notification.request.dto";
import { NotificationResponseDto } from "./dto/notification.response.dto";
import { NotificationsGateway } from "./notification.gateway";

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notifications)
    private readonly notificationRepository: Repository<Notifications>,
    private readonly gateway: NotificationsGateway,
  ) {}

  /**
   * @TODO notification-response-dto 만들어서 적용
   */
  async getNotifications(
    userId: string,
    queries: NotificationRequestDto,
  ): Promise<PagedResponseDto<NotificationResponseDto>> {
    const limit = Number(queries.limit ?? 10);
    const take = limit + 1;

    // QueryBuilder를 사용하여 복합 커서 조건 구현
    const queryBuilder = this.notificationRepository
      .createQueryBuilder("notification")
      .where("notification.recipient = :userId", { userId })
      .orderBy("notification.createdAt", "DESC")
      .addOrderBy("notification.id", "DESC")
      .take(take);

    // 커서 조건 추가: createdAt < cursorDate OR (createdAt = cursorDate AND id < cursorId)
    if (queries.cursorId && queries.cursorDate) {
      queryBuilder.andWhere(
        "(notification.createdAt < :cursorDate OR (notification.createdAt = :cursorDate AND notification.id < :cursorId))",
        {
          cursorDate: new Date(queries.cursorDate),
          cursorId: queries.cursorId,
        },
      );
    }

    const notifications = await queryBuilder.getMany();
    const data = notifications.map((n) => NotificationResponseDto.of(n));

    // 다음 페이지 존재 여부 확인 및 커서 생성
    let nextCursor: CursorDto | null = null;
    if (notifications.length > limit) {
      const nextItem = notifications.pop()!; // 마지막 요소 제거
      nextCursor = {
        cursorId: nextItem.id,
        cursorDate: nextItem.createdAt.toISOString(),
      };
    }

    return PagedResponseDto.of(data, nextCursor);
  }

  /**
   * 단일 알림 읽음 처리
   */
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException("알림을 찾을 수 없습니다.");
    }

    if (notification.recipient !== userId) {
      throw new ForbiddenException("해당 알림에 접근할 권한이 없습니다.");
    }

    if (!notification.isRead) {
      await this.notificationRepository.update(notificationId, {
        isRead: true,
      });
    }
  }

  /**
   * 새로운 알림 생성
   */
  async createNotification(
    userId: string,
    request: {
      type: NotificationType;
      segments: NotificationTextSegment[];
    },
  ) {
    const noti = this.notificationRepository.create({
      recipient: userId,
      type: request.type,
      segments: request.segments,
    });

    const newNoti = await this.notificationRepository.save(noti);

    this.gateway.sendToUser(userId, NotificationResponseDto.of(newNoti));
  }
}
