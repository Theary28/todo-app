import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProfile1792246146658 implements MigrationInterface {
    name = 'CreateProfile1792246146658'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "profiles" ("id" SERIAL NOT NULL, "username" character varying(30) NOT NULL, "displayName" character varying(50) NOT NULL, "email" character varying(254) NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_d1ea35db5be7c08520d70dc03f8" UNIQUE ("username"), CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`);
        // Seed the single profile (no auth yet)
        await queryRunner.query(`INSERT INTO "profiles" ("username", "displayName", "email") VALUES ('demo', 'Demo User', 'demo@example.com')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "profiles"`);
    }

}
