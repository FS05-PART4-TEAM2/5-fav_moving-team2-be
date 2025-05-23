// src/common/storage/storage.module.ts
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CloudinaryStorageService } from "./cloudinary/cloudinary-storage.service";
import { CloudinaryModule } from "./cloudinary/cloudinary-storage.module";
import { S3Module } from "./s3/s3-storage.module";
import { S3StorageService } from "./s3/s3-storage.service";

@Module({
  imports: [ConfigModule, CloudinaryModule, S3Module],
  providers: [
    {
      provide: "StorageService",
      useFactory: (
        configService: ConfigService,
        cloudinaryService: CloudinaryStorageService,
        s3Service: S3StorageService,
      ) => {
        const env = configService.get<string>("NODE_ENV");
        return env === "production" ? s3Service : cloudinaryService;
      },
      inject: [ConfigService, CloudinaryStorageService, S3StorageService],
    },
  ],
  exports: ["StorageService"],
})
export class StorageModule {}
