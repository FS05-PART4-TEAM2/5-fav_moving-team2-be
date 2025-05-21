// src/types/express-session.d.ts (또는 아무 위치에 이 파일 하나만 추가)
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    oauthrole?: string;
  }
}
