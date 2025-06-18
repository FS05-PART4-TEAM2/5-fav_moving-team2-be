import { Inject, Injectable } from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";
import { StorageService } from "src/common/interfaces/storage.service";
import { Readable } from "stream";

@Injectable()
export class CloudinaryStorageService implements StorageService {
  constructor(
    @Inject("CLOUDINARY")
    private readonly cloudinaryClient: typeof cloudinary,
  ) {}

  async upload(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = this.cloudinaryClient.uploader.upload_stream(
        { folder: "profile" },
        (err, result) => {
          if (err) return reject(new Error(err.message)); // ✅ 반드시 Error 객체
          if (!result?.secure_url)
            return reject(new Error("Cloudinary 업로드 실패")); // ✅ 명확한 메시지

          resolve(result.secure_url);
        },
      );

      Readable.from(file.buffer).pipe(upload); // ✅ 의존성 없이 가능
    });
  }
}
