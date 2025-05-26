import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Mover } from "../mover.entity";
import { Repository } from "typeorm";
import { StorageService } from "src/common/interfaces/storage.service";
import { ServiceTypeKey } from "src/common/constants/service-type.constant";
import { RegionKey } from "src/common/constants/region.constant";
import { MoverProfileResponseDto } from "../dto/customer-profile.response.dto";

@Injectable()
export class MoverProfileService {
  constructor(
    @InjectRepository(Mover)
    private moverRepository: Repository<Mover>,
    @Inject("StorageService")
    private readonly storageService: StorageService,
  ) {}

  async modify(
    userId: string,
    request: {
      file: Express.Multer.File | undefined;
      nickname: string;
      career: string;
      intro: string;
      detailDescription: string;
      serviceList: ServiceTypeKey[];
      serviceArea: RegionKey[];
    },
  ): Promise<MoverProfileResponseDto> {
    let url: string | null = null;

    if (request.file) {
      url = await this.storageService.upload(request.file);

      if (typeof this.storageService.getSignedUrlFromS3Url === "function") {
        url = await this.storageService.getSignedUrlFromS3Url(url);
      }
    }

    const mover = await this.moverRepository.findOneBy({
      id: userId,
    });

    if (!mover) throw new ForbiddenException();

    const updated = this.moverRepository.merge(mover, {
      profileImage: url,
      nickname: request.nickname,
      career: request.career,
      intro: request.intro,
      detailDescription: request.detailDescription,
      serviceList: request.serviceList,
      serviceArea: request.serviceArea,
      isProfile: true,
    });

    return MoverProfileResponseDto.of(updated);
  }
}
