// src/database/data-source.ts
import { DataSource } from "typeorm";
import { config } from "dotenv";
import * as fs from "fs";
import * as path from "path";

// 환경에 따른 .env 파일 로드
const envFile =
  process.env.NODE_ENV === "production" ? ".env.production" : ".env";
config({ path: envFile });

const isProduction = process.env.NODE_ENV === "production";
const useSSL = process.env.DB_SSL === "true";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl:
    isProduction && useSSL
      ? {
          ca: fs
            .readFileSync(
              path.join(__dirname, "..", "..", "rds-combined-ca-bundle.pem"),
            )
            .toString(),
        }
      : useSSL,
  entities: [path.join(__dirname, "../**/*.entity.{js,ts}")],
  migrations: [path.join(__dirname, "./migrations/*.{js,ts}")],

  synchronize: !isProduction, // 마이그레이션 사용 시 false로 설정
});
