import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  /* 
  가장 핵심적인 문제. 어떻게 역할마다 분리해서 로그인 다르게 처리 할 수 있을까?
  1. strategy를 customer, mover별로 분리해서 각기 다르게 분리 처리한다 (확장성이 낮고 유지보수 떨어짐)
  2. role에 대한 param값을 state에 저장하여 strategy에서 해당 부분을 req에서 읽어온다.
  */
  @Get('google/:role/login')
  @UseGuards(AuthGuard('google'))
  googleLogin(@Param('role') role:string, @Req() req: Request) {
    // 이 핸들러는 실제로 실행되지 않음. 바로 구글 로그인 페이지로 이동.
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  googleRedirect(@Req() req: Request) {
    //req.user의 role에 따라 분기처리 예정
    console.log(req.user);
  }

}
