import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { Customer } from "../customer.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ServiceTypeKey } from "src/common/constants/service-type.constant";
import { RegionKey } from "src/common/constants/region.constant";
import { StorageService } from "src/common/interfaces/storage.service";
import { CustomerProfileResponseDto } from "../dto/customer-profile.response.dto";

@Injectable()
export class CustomerProfileService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @Inject("StorageService")
    private readonly storageService: StorageService,
  ) {}

  async create(
    userId: string,
    request: {
      file: Express.Multer.File | undefined;
      wantService: ServiceTypeKey[];
      livingPlace: RegionKey[];
    },
  ): Promise<CustomerProfileResponseDto> {
    let url: string | null = null;

    console.log("11111");
    if (request.file) {
      url = await this.storageService.upload(request.file);

      if (typeof this.storageService.getSignedUrlFromS3Url === "function") {
        url = await this.storageService.getSignedUrlFromS3Url(url);
      }
    }

    console.log("22222");
    const customer = await this.customerRepository.findOneBy({
      id: userId,
    });
    console.log("33333");

    if (!customer) throw new ForbiddenException();

    const updated = this.customerRepository.merge(customer, {
      profileImage: url,
      wantService: request.wantService,
      livingPlace: request.livingPlace,
      isProfile: true,
    });

    return CustomerProfileResponseDto.of(updated);
  }
}
