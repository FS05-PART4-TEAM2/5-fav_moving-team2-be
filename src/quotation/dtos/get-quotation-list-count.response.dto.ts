import { RegionKey } from "src/common/constants/region.constant";
import { ServiceTypeKey } from "src/common/constants/service-type.constant";

export class QuotationStatisticsDto {
  moveTypeStats: {
    [key in ServiceTypeKey]: number;
  };
  startRegionStats: { [key in RegionKey]: number };
  endRegionStats: { [key in RegionKey]: number };
  assignedQuotationCount: number;
  totalQuotationCount: number;
}
