import { Module } from "@nestjs/common";
import { S3Provider } from "./s3-storage.provider";
import { S3StorageService } from "./s3-storage.service";

@Module({
  providers: [S3Provider, S3StorageService],
  exports: [S3StorageService],
})
export class S3Module {}
