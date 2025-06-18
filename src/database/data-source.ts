// src/database/data-source.ts
import { DataSource } from "typeorm";
import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";

// 환경에 따른 .env 파일 로드
config({ path: ".env" });

const isProduction = process.env.NODE_ENV === "production";
const useSSL = process.env.DB_SSL === "true";

console.log("Environment check:", {
  NODE_ENV: process.env.NODE_ENV,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_DATABASE: process.env.DB_DATABASE,
});

const AppDataSource = new DataSource({
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

export default AppDataSource;
