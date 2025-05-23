import { Inject, Injectable } from "@nestjs/common";
import { Customer } from "../customer.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ServiceTypeKey } from "src/common/constants/service-type.constant";
import { RegionKey } from "src/common/constants/region.constant";
import { StorageService } from "src/common/interfaces/storage.service";

@Injectable()
export class CustomerProfileService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @Inject("StorageService")
    private readonly storageService: StorageService,
  ) {}

  async create(request: {
    file: Express.Multer.File;
    wantService: ServiceTypeKey;
    livingPlace: RegionKey;
  }): Promise<null> {
    let url = await this.storageService.upload(request.file);

    if (this.storageService.getSignedUrlFromS3Url) {
      url = await this.storageService.getSignedUrlFromS3Url(url);
    }

    console.log("url::", url);

    return null;
  }
}
