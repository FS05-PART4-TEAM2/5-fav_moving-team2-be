import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import * as path from "path";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get<string>("NODE_ENV") === "production";
        const useSSL = config.get<string>("DB_SSL") === "true";

        return {
          type: "postgres",
          host: config.get<string>("DB_HOST"),
          port: config.get<number>("DB_PORT"),
          username: config.get<string>("DB_USERNAME"),
          password: config.get<string>("DB_PASSWORD"),
          database: config.get<string>("DB_DATABASE"),
          ssl:
            isProduction && useSSL
              ? (() => {
                  try {
                    const certPath = path.join(
                      __dirname,
                      "..",
                      "..",
                      "rds-combined-ca-bundle.pem",
                    );
                    return { ca: fs.readFileSync(certPath).toString() };
                  } catch (err) {
                    console.warn(
                      "SSL 인증서 파일이 없습니다. ssl: false 로 fallback합니다.",
                    );
                    return false;
                  }
                })()
              : useSSL,
          entities: [__dirname + "/../**/*.entity{.ts,.js}"],
          synchronize: !isProduction,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
