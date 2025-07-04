import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Mover } from "../mover.entity";
import { Repository } from "typeorm";
import { StorageService } from "src/common/interfaces/storage.service";
import { ServiceTypeKey } from "src/common/constants/service-type.constant";
import { RegionKey } from "src/common/constants/region.constant";
import { MoverProfileResponseDto } from "../dto/mover-profile.response.dto";
import * as bcrypt from "bcrypt";
import { InvalidCredentialsException } from "src/common/exceptions/invalid-credentials.exception";

@Injectable()
export class MoverProfileService {
  constructor(
    @InjectRepository(Mover)
    private moverRepository: Repository<Mover>,
    @Inject("StorageService")
    private readonly storageService: StorageService,
  ) {}

  async modifyProfile(
    userId: string,
    request: {
      file: Express.Multer.File | undefined;
      nickname: string;
      career: number;
      intro: string;
      detailDescription: string;
      serviceList: ServiceTypeKey[];
      serviceArea: RegionKey[];
    },
  ): Promise<MoverProfileResponseDto> {
    let url: string | null = null;

    if (request.file) {
      url = await this.storageService.upload(request.file);
    } else {
      const exists_url = await this.moverRepository.findOne({
        where: {
          id: userId,
        },
        select: {
          profileImage: true,
        },
      });
      url = exists_url?.profileImage ?? null;
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
    const saved = await this.moverRepository.save(updated);

    /** */
    let profileImage = mover.profileImage;
    // if (
    //   typeof this.storageService.getSignedUrlFromS3Url === "function" &&
    //   profileImage !== null
    // ) {
    //   profileImage =
    //     await this.storageService.getSignedUrlFromS3Url(profileImage);
    // }

    return MoverProfileResponseDto.of(saved, profileImage);
  }

  /**  */
  async modifyInfo(
    userId: string,
    request: {
      username: string;
      email: string;
      phoneNumber: string;
      currPassword: string;
      newPassword: string;
    },
  ): Promise<MoverProfileResponseDto> {
    const { currPassword, newPassword, ...rest } = request;

    const mover = await this.moverRepository.findOneBy({
      id: userId,
    });

    if (!mover) throw new ForbiddenException();

    /** password 처리 */
    let hashedPassword = mover.password;
    if (currPassword || newPassword) {
      if (!currPassword || !newPassword) {
        throw new BadRequestException(
          "Both current and new passwords must be provided.",
        );
      }

      const isPasswordValid = await bcrypt.compare(
        currPassword,
        mover.password,
      );
      if (!isPasswordValid) {
        throw new InvalidCredentialsException();
      }

      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    /** */
    const updated = this.moverRepository.merge(mover, {
      password: hashedPassword,
      ...rest,
    });
    const saved = await this.moverRepository.save(updated);

    /** */
    let profileImage = mover.profileImage;
    // if (
    //   typeof this.storageService.getSignedUrlFromS3Url === "function" &&
    //   profileImage !== null
    // ) {
    //   profileImage =
    //     await this.storageService.getSignedUrlFromS3Url(profileImage);
    // }

    return MoverProfileResponseDto.of(saved, profileImage);
  }

  /** */
  async getProfile(userId: string): Promise<MoverProfileResponseDto> {
    const mover = await this.moverRepository.findOneBy({
      id: userId,
    });

    if (!mover) throw new ForbiddenException();

    let profileImage = mover.profileImage;
    // if (
    //   typeof this.storageService.getSignedUrlFromS3Url === "function" &&
    //   profileImage !== null
    // ) {
    //   profileImage =
    //     await this.storageService.getSignedUrlFromS3Url(profileImage);
    // }

    return MoverProfileResponseDto.of(mover, profileImage);
  }
}
