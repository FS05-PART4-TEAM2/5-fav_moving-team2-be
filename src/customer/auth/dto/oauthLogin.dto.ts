import { Type } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";
import { SafeCustomer } from "src/customer/types/customerWithoutPw";
import { SafeMover } from "src/customer/types/moverWithoutPw";

export class OauthLoginRequestDto {
  @IsString()
  email: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  photo: string;

  @IsString()
  provider: string;

  @IsString()
  role: string;
}

export class MoverOauthLoginResponseDto {
  @IsString()
  refreshToken: string;

  @IsString()
  accessToken: string;

  mover: SafeMover
}

export class CustomerOauthLoginResponseDto {
  @IsString()
  refreshToken: string;

  @IsString()
  accessToken: string;

  customer: SafeCustomer
}