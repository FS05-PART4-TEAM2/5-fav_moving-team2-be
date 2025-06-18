// tasks.module.ts
import { Module } from "@nestjs/common";
import { TaskService } from "./task.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Quotation } from "src/quotation/quotation.entity";
import { QuotationModule } from "src/quotation/quotation.module";
import { NotificationsModule } from "src/notifications/notification.module";

@Module({
  imports: [TypeOrmModule.forFeature([Quotation]), QuotationModule, NotificationsModule],
  providers: [TaskService],
})
export class TaskModule {}
