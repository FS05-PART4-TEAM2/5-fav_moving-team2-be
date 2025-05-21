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
              ? {
                  ca: fs
                    .readFileSync(
                      path.join(
                        __dirname,
                        "..",
                        "..",
                        "rds-combined-ca-bundle.pem",
                      ),
                    )
                    .toString(),
                }
              : useSSL,
          entities: [__dirname + "/../**/*.entity{.ts,.js}"],
          synchronize: true,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
