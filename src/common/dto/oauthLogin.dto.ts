import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

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
  @ApiProperty({ example: "REFRESH_TOKEN", description: "리프레시 토큰" })
  refreshToken: string;

  @IsString()
  @ApiProperty({ example: "ACCESS_TOKEN", description: "엑세스 토큰" })
  accessToken: string;

  type: "mover";
}

export class CustomerOauthLoginResponseDto {
  @IsString()
  @ApiProperty({ example: "REFRESH_TOKEN", description: "리프레시 토큰" })
  refreshToken: string;

  @IsString()
  @ApiProperty({ example: "ACCESS_TOKEN", description: "엑세스 토큰" })
  accessToken: string;

  type: "customer";
}
