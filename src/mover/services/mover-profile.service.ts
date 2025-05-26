import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Mover } from "../mover.entity";
import { Repository } from "typeorm";
import { StorageService } from "src/common/interfaces/storage.service";
import { ServiceTypeKey } from "src/common/constants/service-type.constant";
import { RegionKey } from "src/common/constants/region.constant";

@Injectable()
export class MoverProfileService {
  constructor(
    @InjectRepository(Mover)
    private customerRepository: Repository<Mover>,
    @Inject("StorageService")
    private readonly storageService: StorageService,
  ) {}

  modify(
    userId: string,
    request: {
      file: Express.Multer.File | undefined;
      nickname: string;
      career: string;
      intro: string;
      detailDescription: string;
      wantService: ServiceTypeKey[];
      livingPlace: RegionKey[];
    },
  ): void {
    console.log("mover modify::", userId, request);
  }
}
