// src/common/interfaces/storage.service.ts
export abstract class StorageService {
  abstract upload(file: Express.Multer.File): Promise<string>;
  getSignedUrlFromS3Url?(s3Url: string): Promise<string>; // ✅ optional
}
