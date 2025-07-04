import { Module } from "@nestjs/common";
import { CloudinaryProvider } from "./cloudinary-storage.provider";
import { CloudinaryStorageService } from "./cloudinary-storage.service";

@Module({
  providers: [CloudinaryProvider, CloudinaryStorageService],
  exports: [CloudinaryStorageService],
})
export class CloudinaryModule {}
