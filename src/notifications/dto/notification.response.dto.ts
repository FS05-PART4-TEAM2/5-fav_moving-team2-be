import { ApiProperty } from "@nestjs/swagger";
import { Notifications, NotificationTextSegment } from "../notification.entity";

export class NotificationTextSegmentDto {
  @ApiProperty({
    description: "텍스트 내용",
    example: "새로운 견적이 도착했습니다.",
  })
  text: string;

  @ApiProperty({
    description: "하이라이트 여부",
    example: true,
  })
  isHighlight: boolean;
}

export class NotificationResponseDto {
  @ApiProperty({
    description: "알림 ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "알림 타입",
    enum: ["QUOTE_ARRIVED", "QUOTE_CONFIRMED", "MOVE_SCHEDULE"],
    example: "QUOTE_ARRIVED",
  })
  type: string;

  @ApiProperty({
    description: "알림 텍스트 세그먼트 배열",
    type: [NotificationTextSegmentDto],
    example: [
      { text: "새로운 ", isHighlight: false },
      { text: "견적", isHighlight: true },
      { text: "이 도착했습니다.", isHighlight: false },
    ],
  })
  segments: NotificationTextSegmentDto[];

  @ApiProperty({
    description: "읽음 여부",
    example: false,
  })
  isRead: boolean;

  @ApiProperty({
    description: "견적 ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  quotationId: string;

  @ApiProperty({
    description: "생성일시",
    example: "2025-06-12T10:30:00.000Z",
  })
  createdAt: string;

  static of(n: Notifications) {
    const dto = new NotificationResponseDto();

    dto.id = n.id;
    dto.type = n.type;
    dto.segments = n.segments.map((segment: NotificationTextSegment) => ({
      text: segment.text,
      isHighlight: segment.isHighlight,
    }));
    dto.isRead = n.isRead;
    dto.createdAt = n.createdAt.toISOString();

    return dto;
  }
}
