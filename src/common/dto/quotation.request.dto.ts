import { IsString, IsDate, IsNotEmpty, IsOptional } from "class-validator";

export class CustomerCreateQuotationRequestDto {
  @IsString()
  @IsNotEmpty()
  moveType: string;

  @IsString()
  @IsNotEmpty()
  moveDate: string;

  @IsString()
  @IsNotEmpty()
  startAddress: string;

  @IsString()
  @IsNotEmpty()
  endAddress: string;

  @IsString()
  @IsOptional()
  customerId?: string;
}
