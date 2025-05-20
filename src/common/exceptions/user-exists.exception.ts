// src/common/exceptions/user-exists.exception.ts
import { HttpException, HttpStatus } from "@nestjs/common";

export class UserExistsException extends HttpException {
  constructor(duplicatedUser: { email?: string; nickname?: string }) {
    const messages: string[] = [];
    if (duplicatedUser.email) {
      messages.push(`이미 존재하는 이메일입니다`);
    }
    if (duplicatedUser.nickname) {
      messages.push(`이미 존재하는 닉네임입니다`);
    }

    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: messages.join(", "),
        error: "UserAlreadyExistsException",
      },
      HttpStatus.CONFLICT,
    );
  }
}
