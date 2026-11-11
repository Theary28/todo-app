import { MigrationInterface, QueryRunner } from "typeorm";

export class LinkProfileToUser1792900000000 implements MigrationInterface {
    name = 'LinkProfileToUser1792900000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles" ADD "userId" uuid`);
        // The seeded 'demo' profile belongs to the demo user created in AddUsersAndAuth.
        await queryRunner.query(`UPDATE "profiles" SET "userId" = (SELECT "id" FROM "users" WHERE "email" = 'demo@example.com') WHERE "username" = 'demo'`);
        // Any other pre-auth profile has no owner; users get a fresh one on first access.
        await queryRunner.query(`DELETE FROM "profiles" WHERE "userId" IS NULL`);
        await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD CONSTRAINT "UQ_profiles_userId" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD CONSTRAINT "FK_profiles_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT "FK_profiles_userId"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT "UQ_profiles_userId"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "userId"`);
    }

}
