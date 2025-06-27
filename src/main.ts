// For libraries expecting Web Crypto API in Node.js (e.g. `crypto.subtle`)
import * as crypto from "crypto";
if (typeof globalThis.crypto === "undefined") {
  // @ts-ignore
  globalThis.crypto = crypto;
}

import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";
import * as cookieParser from "cookie-parser";
import { NestExpressApplication } from "@nestjs/platform-express";
import { QUOTATION_STATE_KEY } from "./common/constants/quotation-state.constant";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  /** class-validator가 정상 동작하도록 전역 파이프 적용  */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 프로퍼티는 무조건 제거
      forbidNonWhitelisted: false, // DTO에 정의되지 않은 값이 오면 에러 처리
      transform: true, // 컨트롤러에서 DTO 클래스로 변환
    }),
  );

  /** 전역 예외 설정 */
  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors({
    origin: [
      "http://localhost:3000",
      "https://5-favmoving-team2-fe.vercel.app",
      "https://5-moving-team2.vercel.app",
    ], // 허용할 Origin
    credentials: true, // 쿠키 허용
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // 허용할 HTTP 메서드
    allowedHeaders: "Content-Type, Authorization", // 허용할 헤더
  });

  /** swagger 설정 */
  const config = new DocumentBuilder()
    .setTitle("NestJS Tutorial - Panda Market Migration")
    .setDescription("The Panda Markets API description")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "Authorization",
        in: "header",
      },
      "access-token", // 이 이름은 아래 @ApiBearerAuth()에 사용됨
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, document);

  app.use(cookieParser());
  // 프록시 신뢰 설정
  app.set("trust proxy", 1);

  await app.listen(process.env.PORT ?? 8080);
}
void bootstrap();
