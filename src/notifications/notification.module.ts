import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notifications } from "./notification.entity";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { AuthModule } from "src/auth/auth.module";
import { NotificationsGateway } from "./notification.gateway";

@Module({
  imports: [TypeOrmModule.forFeature([Notifications]), AuthModule],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationsGateway],
})
export class NotificationsModule {}
