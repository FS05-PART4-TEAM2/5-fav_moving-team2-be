import { IsEnum, IsString } from "class-validator";
import {
  SERVICE_TYPES,
  ServiceTypeKey,
} from "src/common/constants/service-type.constant";
import { REGIONS, RegionKey } from "src/common/constants/region.constant";
import { ApiProperty } from "@nestjs/swagger";
import { toEnumObject } from "src/common/utils/enum-object.util";

const ServiceEnum = toEnumObject(SERVICE_TYPES);
const RegionEnum = toEnumObject(REGIONS);

export class CustomerProfileRequestDto {
  @IsString()
  profileImg: string;

  @ApiProperty({
    enum: SERVICE_TYPES.map((s) => s.key),
    description: "이용 서비스 종류",
    example: "SMALL_MOVE",
  })
  @IsEnum(ServiceEnum)
  wantService: ServiceTypeKey;

  @ApiProperty({
    enum: REGIONS.map((r) => r.key),
    description: "거주 지역",
    example: "SEOUL",
  })
  @IsEnum(RegionEnum)
  livingPlace: RegionKey;
}
