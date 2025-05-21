import { HttpException, HttpStatus } from "@nestjs/common";

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: "이메일 또는 비밀번호가 일치하지 않습니다.",
        error: "InvalidCredentialsException",
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
