import {
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from "class-validator";

export class CustomerProfileRequestDto {
  @IsString()
  @MinLength(2)
  nickname: string;

  @IsString()
  career: string;

  @IsString()
  intro: string;

  @IsString()
  detailDescription: string;

  @IsString()
  serviceList: string;

  @IsString()
  serviceArea: string;
}
