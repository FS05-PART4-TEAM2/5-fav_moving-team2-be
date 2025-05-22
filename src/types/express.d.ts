// src/types/express.d.ts
import { Request } from 'express';

declare global {
  namespace Express {
    interface User {
      email: string;
      name: string;
      photo: string;
      provider: string;
      providerId: string;
      role: string; // 여기에 role 추가
    }
  }
}
