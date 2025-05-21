import { IsOptional, IsString } from "class-validator";

export class OauthLoginDto {
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