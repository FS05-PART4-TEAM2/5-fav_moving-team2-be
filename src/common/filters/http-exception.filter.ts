// common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { CommonApiResponse } from "../dto/api-response.dto";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    // const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = "서버 내부 오류입니다.";
    let errorName = "INTERNAL_SERVER_ERROR";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
      errorName = exception.name;
    }

    let errorMessage: string;
    if (typeof message === "string") {
      errorMessage = message;
    } else if (
      typeof message === "object" &&
      message !== null &&
      "message" in message
    ) {
      errorMessage = message.message as string;
    } else {
      errorMessage = "알 수 없는 에러입니다.";
    }

    if (status === 500) console.error("[AllExceptionsFilter]", exception);
    res.status(status).json(CommonApiResponse.fail(errorMessage, errorName));
  }
}
