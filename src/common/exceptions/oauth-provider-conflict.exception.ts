import { HttpException, HttpStatus } from '@nestjs/common';

export class OauthProviderConflictException extends HttpException {
  constructor(currentProvider: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: `${currentProvider} 계정으로 가입되어 있는 회원입니다.`,
        error: 'OauthProviderConflictException',
      },
      HttpStatus.CONFLICT,
    );
  }
}