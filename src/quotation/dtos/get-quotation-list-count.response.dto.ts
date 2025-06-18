import { ApiProperty } from "@nestjs/swagger";
import { RegionKey } from "src/common/constants/region.constant";
import { ServiceTypeKey } from "src/common/constants/service-type.constant";

export class QuotationStatisticsDto {
  @ApiProperty({
    description: "이사 유형별 통계",
    example: {
      APARTMENT: 3,
      SINGLE_HOUSE: 1,
      OFFICE: 2,
    },
  })
  moveTypeStats: {
    [key in ServiceTypeKey]: number;
  };

  @ApiProperty({
    description: "출발 지역별 통계",
    example: {
      SEOUL: 2,
      GYEONGGI: 3,
    },
  })
  startRegionStats: { [key in RegionKey]: number };

  @ApiProperty({
    description: "도착 지역별 통계",
    example: {
      SEOUL: 1,
      BUSAN: 4,
    },
  })
  endRegionStats: { [key in RegionKey]: number };

  @ApiProperty({ description: "지정 견적 개수", example: 4 })
  assignedQuotationCount: number;

  @ApiProperty({ description: "전체 견적 개수", example: 10 })
  totalQuotationCount: number;
}
