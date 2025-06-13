import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

export interface NotificationTextSegment {
  text: string;
  isHighlight: boolean;
}

export type NotificationType =
  | "QUOTE_ARRIVED"
  | "QUOTE_CONFIRMED"
  | "MOVE_SCHEDULE";

@Entity()
export class Notifications {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // 수령인
  @Column()
  recipient: string;

  @Column({
    type: "enum",
    enum: ["QUOTE_ARRIVED", "QUOTE_CONFIRMED", "MOVE_SCHEDULE"],
  })
  type: NotificationType;

  @Column("jsonb")
  segments: NotificationTextSegment[];

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
