import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1750758711478 implements MigrationInterface {
    name = 'Migration1750758711478'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" RENAME COLUMN "quotationId" TO "receivedQuoteId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" RENAME COLUMN "receivedQuoteId" TO "quotationId"`);
    }

}
