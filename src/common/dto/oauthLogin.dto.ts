import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";
import { SafeCustomer } from "src/customer/types/customerWithoutPw";
import { SafeMover } from "src/customer/types/moverWithoutPw";

export class OauthLoginRequestDto {
  @IsString()
  @ApiProperty({ example: "test@naver.com", description: "사용자 이메일" })
  email: string;

  @ApiProperty({ example: "test", description: "사용자 명" })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: "http://img.test.com/img.png",
    description: "프로필 이미지 주소",
  })
  photo: string;

  @IsString()
  @ApiProperty({ example: "google", description: "OAuth 제공자" })
  provider: string;

  @IsString()
  @ApiProperty({ example: "customer", description: "사용자 역할" })
  role: string;
}

export class MoverOauthLoginResponseDto {
  @IsString()
  @ApiProperty({ example: "REFRESH_TOKEN", description: "리프레시 토큰"})
  refreshToken: string;

  @IsString()
  @ApiProperty({ example: "ACCESS_TOKEN", description: "엑세스 토큰"})
  accessToken: string;

  @ApiProperty({ description: "기사 객체 (비밀번호 제외)"})
  mover: SafeMover;
}

export class CustomerOauthLoginResponseDto {
  @IsString()
  @ApiProperty({ example: "REFRESH_TOKEN", description: "리프레시 토큰"})
  refreshToken: string;

  @IsString()
  @ApiProperty({ example: "ACCESS_TOKEN", description: "엑세스 토큰"})
  accessToken: string;

  @ApiProperty({ description: "손님 객체 (비밀번호 제외)"})
  customer: SafeCustomer;
}
