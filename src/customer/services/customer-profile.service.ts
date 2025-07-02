import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { Customer } from "../customer.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ServiceTypeKey } from "src/common/constants/service-type.constant";
import { RegionKey } from "src/common/constants/region.constant";
import { StorageService } from "src/common/interfaces/storage.service";
import { CustomerProfileResponseDto } from "../dto/customer-profile.response.dto";
import * as bcrypt from "bcrypt";
import { InvalidCredentialsException } from "src/common/exceptions/invalid-credentials.exception";
import { Quotation } from "src/quotation/quotation.entity";

@Injectable()
export class CustomerProfileService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Quotation)
    private quotationRepository: Repository<Quotation>,
    @Inject("StorageService")
    private readonly storageService: StorageService,
  ) {}

  async create(
    userId: string,
    request: {
      file: Express.Multer.File | undefined;
      username?: string;
      currPassword?: string;
      newPassword?: string;
      wantService: ServiceTypeKey[];
      livingPlace: RegionKey[];
    },
  ): Promise<CustomerProfileResponseDto> {
    let url: string | null = null;
    const { file, currPassword, newPassword, ...rest } = request;

    /** customer 조회 */
    const customer = await this.customerRepository.findOneBy({
      id: userId,
    });

    if (!customer) throw new ForbiddenException();

    /** password 처리 */
    let hashedPassword = customer.password;
    if (currPassword && newPassword) {
      if (!currPassword || !newPassword) {
        throw new BadRequestException(
          "Both current and new passwords must be provided.",
        );
      }
      const isPasswordValid = await bcrypt.compare(
        currPassword,
        customer.password,
      );
      if (!isPasswordValid) {
        throw new InvalidCredentialsException();
      }

      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    if (file) {
      url = await this.storageService.upload(file);
    } else {
      const exists_url = await this.customerRepository.findOne({
        where: {
          id: userId,
        },
        select: {
          profileImage: true,
        },
      });
      url = exists_url?.profileImage ?? null;
    }

    const updated = this.customerRepository.merge(customer, {
      profileImage: url,
      isProfile: true,
      password: hashedPassword,
      ...rest,
    });

    const saved = await this.customerRepository.save(updated);

    let profileImage = customer.profileImage;
    // if (
    //   typeof this.storageService.getSignedUrlFromS3Url === "function" &&
    //   profileImage !== null
    // ) {
    //   profileImage =
    //     await this.storageService.getSignedUrlFromS3Url(profileImage);
    // }

    return CustomerProfileResponseDto.of(saved, profileImage);
  }

  /** */
  async getProfile(userId: string): Promise<CustomerProfileResponseDto> {
    const customer = await this.customerRepository.findOneBy({
      id: userId,
    });

    if (!customer) throw new ForbiddenException();

    const hasQuotation = await this.quotationRepository.exists({
      where: {
        customerId: userId,
      },
    });

    let profileImage = customer.profileImage;
    // if (
    //   typeof this.storageService.getSignedUrlFromS3Url === "function" &&
    //   profileImage !== null
    // ) {
    //   profileImage =
    //     await this.storageService.getSignedUrlFromS3Url(profileImage);
    // }

    return CustomerProfileResponseDto.of(customer, profileImage, hasQuotation);
  }
}
