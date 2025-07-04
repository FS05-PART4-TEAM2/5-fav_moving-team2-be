import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { MoverModule } from "./mover/mover.module";
import { CustomerModule } from "./customer/customer.module";
import { StorageModule } from "./common/storage/storage.module";
import { QuotationModule } from "./quotation/quotation.module";
import { LikeModule } from "./likeMover/likeMover.module";
import { MoverReviewModule } from "./moverReview/moverReview.module";
import { NotificationsModule } from "./notifications/notification.module";
import { TaskModule } from "./task/task.module";
import { ScheduleModule } from "@nestjs/schedule";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { LoggingInterceptor } from "./common/interceptors/loggin.interceptor";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 모든 모듈에서 import 없이 사용 가능
      // envFilePath: `.env`, // 또는 환경에 따라 다른 파일명을 사용
      envFilePath: [".env", `.env.${process.env.NODE_ENV}`],
    }),
    DatabaseModule,
    MoverModule,
    CustomerModule,
    StorageModule,
    QuotationModule,
    LikeModule,
    MoverReviewModule,
    NotificationsModule,
    ScheduleModule.forRoot(),
    TaskModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
