import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1750751645306 implements MigrationInterface {
  name = "Migration1750751645306";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "quotationId" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "quotationId"`,
    );
  }
}
