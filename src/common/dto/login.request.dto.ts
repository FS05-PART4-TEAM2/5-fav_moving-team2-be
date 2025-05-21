import { IsEmail, IsString, Matches, MinLength } from "class-validator";

export class LoginRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(9)
  @Matches(/^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{9,}$/, {
    message:
      "password must be at least 9 characters long and contain at least one number and one special character.",
  })
  password: string;
}
