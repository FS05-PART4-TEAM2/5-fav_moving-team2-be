import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1750223918435 implements MigrationInterface {
  name = "Migration1750223918435";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "quotation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "moveType" character varying NOT NULL, "moveDate" character varying NOT NULL, "price" character varying, "startAddress" character varying NOT NULL, "endAddress" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'PENDING', "customerId" character varying NOT NULL, "assignMover" text, "confirmedMoverId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_596c572d5858492d10d8cf5383d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('QUOTE_ARRIVED', 'QUOTE_CONFIRMED', 'MOVE_SCHEDULE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recipient" character varying NOT NULL, "type" "public"."notifications_type_enum" NOT NULL, "segments" jsonb NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "like_mover" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "moverId" character varying NOT NULL, "customerId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_13544303f4924346da7fd0caa71" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "mover_review" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, "rating" integer NOT NULL, "moverId" character varying NOT NULL, "quotationId" character varying NOT NULL, "customerId" character varying NOT NULL, "customerNick" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_a07e9fd00ff18def029abd3d99c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "mover" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "idNum" SERIAL NOT NULL, "username" character varying NOT NULL, "nickname" character varying, "isProfile" boolean DEFAULT false, "email" character varying NOT NULL, "password" character varying, "phoneNumber" character varying NOT NULL, "provider" character varying, "profileImage" character varying, "serviceArea" text, "serviceList" text, "intro" text, "career" integer, "detailDescription" text, "likeCount" integer NOT NULL DEFAULT '0', "totalRating" double precision NOT NULL DEFAULT '0', "reviewCounts" integer NOT NULL DEFAULT '0', "confirmedCounts" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_14d682b25fec5e434eb02b4a8cc" UNIQUE ("email"), CONSTRAINT "PK_f2a8b21c1c3b8db00cbab017ff2" PRIMARY KEY ("id", "idNum"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "customer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying, "isProfile" boolean DEFAULT false, "authType" character varying, "provider" character varying, "phoneNumber" character varying NOT NULL, "profileImage" character varying, "wantService" text, "livingPlace" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fdb2f3ad8115da4c7718109a6eb" UNIQUE ("email"), CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "auth" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accessToken" character varying, "refreshToken" character varying, "provider" character varying, "providerId" character varying, "userType" character varying NOT NULL, "userId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "logoutAt" TIMESTAMP, CONSTRAINT "PK_7e416cf6172bc5aec04244f6459" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "received_quote" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "price" integer NOT NULL, "comment" character varying NOT NULL, "isAssignQuo" boolean NOT NULL, "moverId" character varying NOT NULL, "customerId" character varying NOT NULL, "quotationId" character varying NOT NULL, "isCompleted" boolean NOT NULL DEFAULT false, "isConfirmedMover" boolean NOT NULL DEFAULT false, "isReviewed" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_2950655dac016e3e1298f84ebb0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "assign_mover" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying NOT NULL, "rejectedReason" character varying, "moverId" character varying NOT NULL, "customerId" character varying NOT NULL, "quotationId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_5f3f88509be63226c381027b062" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "assign_mover"`);
    await queryRunner.query(`DROP TABLE "received_quote"`);
    await queryRunner.query(`DROP TABLE "auth"`);
    await queryRunner.query(`DROP TABLE "customer"`);
    await queryRunner.query(`DROP TABLE "mover"`);
    await queryRunner.query(`DROP TABLE "mover_review"`);
    await queryRunner.query(`DROP TABLE "like_mover"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    await queryRunner.query(`DROP TABLE "quotation"`);
  }
}
