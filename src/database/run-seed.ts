import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { SeedData } from "./seed-data";

// .env 파일 로드
config();

// ConfigService 인스턴스 생성
const configService = new ConfigService();

async function createDataSource() {
  const isProduction = configService.get<string>("NODE_ENV") === "production";
  const useSSL = configService.get<string>("DB_SSL") === "true";

  return new DataSource({
    type: "postgres",
    host: configService.get<string>("DB_HOST"),
    port: configService.get<number>("DB_PORT"),
    username: configService.get<string>("DB_USERNAME"),
    password: configService.get<string>("DB_PASSWORD"),
    database: configService.get<string>("DB_DATABASE"),
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
    entities: [__dirname + "/../**/*.entity{.ts,.js}"],
    synchronize: !isProduction,
    logging: true,
  });
}

async function main() {
  let AppDataSource: DataSource | undefined; // <-- 수정됨

  try {
    console.log("🚀 Initializing database connection...");
    AppDataSource = await createDataSource();
    await AppDataSource.initialize();
    console.log("✅ Database connected successfully!");

    console.log("🌱 Starting seed process...");
    const seeder = new SeedData(AppDataSource);
    await seeder.seed();
    console.log("✅ Seed data created successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
  } finally {
    if (AppDataSource?.isInitialized) {
      await AppDataSource.destroy();
      console.log("🔌 Database connection closed");
    }
  }
}

main();
