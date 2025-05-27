import { IsIn, IsString } from "class-validator";
import { REGION_KEYS, RegionKey } from "src/common/constants/region.constant";
import { SERVICE_KEYS, ServiceTypeKey } from "src/common/constants/service-type.constant";

export class MoverListRequestDto {

  @IsIn(REGION_KEYS, {
    message: "유효하지 않은 지역 코드입니다."
  })
  region: RegionKey; // 지역 필터링
  
  @IsIn(SERVICE_KEYS, {
    message: "유효하지 않은 서비스 코드입니다."
  })
  service: ServiceTypeKey; // 서비스 필터링
  
  @IsIn(["MOSTREVIEW", "BESTRATING", "HIGHESTEXP", "MOSTCONFIRM"], {
    message: "유효하지 않은 정렬 기준입니다."
  })
  orderBy: "MOSTREVIEW" | "BESTRATING" | "HIGHESTEXP" | "MOSTCONFIRM"; // 정렬 순서

  @IsString()
  keyword: string;
}