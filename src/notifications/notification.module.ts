import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notifications } from "./notification.entity";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Notifications]), AuthModule],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationsModule {}
