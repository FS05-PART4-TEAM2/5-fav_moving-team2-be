import { IsOptional, IsString, Matches, MinLength } from "class-validator";

export class CustomerProfileRequestDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  username?: string;

  @IsString()
  @IsOptional()
  @MinLength(9)
  @Matches(/^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{9,}$/, {
    message:
      "password must be at least 9 characters long and contain at least one number and one special character.",
  })
  currPassword?: string;

  @IsString()
  @IsOptional()
  @MinLength(9)
  @Matches(/^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{9,}$/, {
    message:
      "password must be at least 9 characters long and contain at least one number and one special character.",
  })
  newPassword?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  wantService: string;

  @IsString()
  livingPlace: string;
}
