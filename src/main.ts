import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /** class-validator가 정상 동작하도록 전역 파이프 적용  */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 프로퍼티는 무조건 제거
      forbidNonWhitelisted: true, // DTO에 정의되지 않은 값이 오면 에러 처리
      transform: true, // 컨트롤러에서 DTO 클래스로 변환
    }),
  );

  /** 전역 예외 설정 */
  app.useGlobalFilters(new AllExceptionsFilter());

  /** swagger 설정 */
  const config = new DocumentBuilder()
    .setTitle("NestJS Tutorial - Panda Market Migration")
    .setDescription("The Panda Markets API description")
    .setVersion("1.0")
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, documentFactory);

  await app.listen(process.env.PORT ?? 8080);
}
void bootstrap();
