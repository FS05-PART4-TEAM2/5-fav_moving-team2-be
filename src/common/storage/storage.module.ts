// src/common/storage/storage.module.ts
import { Module } from "@nestjs/common";
import { CloudinaryStorageService } from "./cloudinary/cloudinary-storage.service";
import { CloudinaryModule } from "./cloudinary/cloudinary-storage.module";

@Module({
  imports: [CloudinaryModule], // ✅ 추가 필요
  providers: [
    {
      provide: "StorageService",
      useClass: CloudinaryStorageService,
    },
  ],
  exports: ["StorageService"],
})
export class StorageModule {}
