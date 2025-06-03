// src/common/exceptions/user-exists.exception.ts
import { HttpException, HttpStatus } from "@nestjs/common";

export class InvalidUserException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message: `유효하지 않는 회원입니다.`,
        error: "ForbiddenUserException",
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
