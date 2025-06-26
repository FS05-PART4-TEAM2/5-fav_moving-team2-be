import { ServiceTypeKey } from "src/common/constants/service-type.constant";
import { RegionKey } from "src/common/constants/region.constant";
import { Mover } from "../mover.entity";

export class MoverProfileResponseDto {
  id: string;
  username: string;
  nickname: string;
  email: string;
  isProfile: boolean;
  phoneNumber: string;
  profileImage: string | null;
  intro: string;
  detailDescription: string;
  career: number;
  likeCount: number;
  totalRating: number;
  reviewCounts: number;
  serviceList: ServiceTypeKey[];
  serviceArea: RegionKey[];

  static of(
    mover: Mover,
    profileImage: string | null,
  ): MoverProfileResponseDto {
    const dto = new MoverProfileResponseDto();
    dto.id = mover.id;
    dto.username = mover.username;
    dto.nickname = mover.nickname;
    dto.email = mover.email;
    dto.isProfile = mover.isProfile;
    dto.phoneNumber = mover.phoneNumber;
    dto.profileImage = profileImage;
    dto.intro = mover.intro;
    dto.detailDescription = mover.detailDescription;
    dto.career = mover.career;
    dto.likeCount = mover.likeCount;
    dto.totalRating = mover.totalRating;
    dto.reviewCounts = mover.reviewCounts;
    dto.serviceList = mover.serviceList;
    dto.serviceArea = mover.serviceArea;

    return dto;
  }
}
