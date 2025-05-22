// src/common/interfaces/storage.service.ts
export abstract class StorageService {
  abstract upload(file: Express.Multer.File): Promise<string>;
}
