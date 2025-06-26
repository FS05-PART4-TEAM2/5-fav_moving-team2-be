import { ServiceTypeKey } from "src/common/constants/service-type.constant";
import { RegionKey } from "src/common/constants/region.constant";
import { Customer } from "../customer.entity";

export class CustomerProfileResponseDto {
  id: string;
  username: string;
  email: string;
  isProfile: boolean;
  phoneNumber: string;
  profileImage: string | null;
  wantService: ServiceTypeKey[];
  livingPlace: RegionKey[];
  hasQuotation?: boolean;

  static of(
    customer: Customer,
    profileImage: string | null,
    hasQuotation?: boolean,
  ): CustomerProfileResponseDto {
    const dto = new CustomerProfileResponseDto();
    dto.id = customer.id;
    dto.username = customer.username;
    dto.email = customer.email;
    dto.isProfile = customer.isProfile;
    dto.phoneNumber = customer.phoneNumber;
    dto.profileImage = profileImage;
    dto.wantService = customer.wantService;
    dto.livingPlace = customer.livingPlace;

    if (typeof hasQuotation === "boolean") {
      dto.hasQuotation = hasQuotation;
    }

    return dto;
  }
}
