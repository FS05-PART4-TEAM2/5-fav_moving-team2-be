import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { CustomerModule } from "./customer/customer.module";
import { MoverModule } from "./mover/mover.module";
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 모든 모듈에서 import 없이 사용 가능
      // envFilePath: `.env`, // 또는 환경에 따라 다른 파일명을 사용
    }),
    DatabaseModule,
    CustomerModule,
    MoverModule,
    AuthModule,
  ],
})
export class AppModule {}
