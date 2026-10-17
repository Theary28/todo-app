import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusAndStarred1792302000000 implements MigrationInterface {
    name = 'AddStatusAndStarred1792302000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "todos" ADD "status" character varying(20) NOT NULL DEFAULT 'TODO'`);
        await queryRunner.query(`ALTER TABLE "todos" ADD "starred" boolean NOT NULL DEFAULT false`);
        // Keep existing data meaningful: todos already marked completed become DONE
        await queryRunner.query(`UPDATE "todos" SET "status" = 'DONE' WHERE "completed" = true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "todos" DROP COLUMN "starred"`);
        await queryRunner.query(`ALTER TABLE "todos" DROP COLUMN "status"`);
    }

}
