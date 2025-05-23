import { S3Client } from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";

export const S3Provider = {
  provide: "S3_CLIENT",
  useFactory: (configService: ConfigService) => {
    return new S3Client({
      region: configService.get("AWS_REGION"),
      credentials: {
        accessKeyId: configService.get("S3_ACCESS_KEY")!,
        secretAccessKey: configService.get("S3_SECRET_KEY")!,
      },
    });
  },
  inject: [ConfigService],
};
