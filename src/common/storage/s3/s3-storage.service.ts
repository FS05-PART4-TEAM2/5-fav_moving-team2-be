import { Injectable, Inject } from "@nestjs/common";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { ConfigService } from "@nestjs/config";
import * as path from "path";
import { StorageService } from "src/common/interfaces/storage.service";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class S3StorageService implements StorageService {
  constructor(
    @Inject("S3_CLIENT") private readonly s3: S3Client,
    private readonly configService: ConfigService,
  ) {}

  async upload(file: Express.Multer.File): Promise<string> {
    const ext = path.extname(file.originalname);
    const key = `profile/${randomUUID()}${ext}`;
    const bucket: string = this.configService.get("S3_BUCKET_NAME")!;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3.send(command);

    const publicUrl = `https://${bucket}.s3.${this.configService.get("AWS_REGION")}.amazonaws.com/${key}`;
    return publicUrl;
  }

  // ✅ 2. 저장된 S3 URL로부터 서명된 URL 발급
  async getSignedUrlFromS3Url(
    s3Url: string,
    expiresInSec = 3600,
  ): Promise<string> {
    const bucket: string = this.configService.get("S3_BUCKET_NAME")!;
    const key = this.extractKeyFromS3Url(s3Url);

    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const signedUrl: string = await getSignedUrl(this.s3, getCommand, {
      expiresIn: expiresInSec,
    });
    return signedUrl;
  }

  // 🔧 S3 URL에서 key 추출
  private extractKeyFromS3Url(s3Url: string): string {
    const url = new URL(s3Url);
    return decodeURIComponent(url.pathname.replace(/^\/+/, ""));
  }
}
