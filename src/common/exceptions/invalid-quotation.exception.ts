// src/common/exceptions/user-exists.exception.ts
import { HttpException, HttpStatus } from "@nestjs/common";

export class InvalidQuotationException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: message,
        error: "QuotationExistException",
      },
      HttpStatus.CONFLICT,
    );
  }
}
