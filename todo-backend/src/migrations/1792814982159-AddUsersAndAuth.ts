import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsersAndAuth1792814982159 implements MigrationInterface {
    name = 'AddUsersAndAuth1792814982159'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(254) NOT NULL, "passwordHash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tokenHash" character varying NOT NULL, "userId" uuid NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "revokedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        // Existing todos predate auth: give them to a demo user (password: changeme123)
        // so ownerId can be NOT NULL. Matches the demo profile seeded in CreateProfile.
        await queryRunner.query(`INSERT INTO "users" ("email", "passwordHash") VALUES ('demo@example.com', '$argon2id$v=19$m=65536,p=4,t=3$CmdHQ8caaYHkoxntQgTfTg$eqXHdb8lAuJOjCSkMryEN6HD2Pt3EUzwH94g1xBbo94')`);
        await queryRunner.query(`ALTER TABLE "todos" ADD "ownerId" uuid`);
        await queryRunner.query(`UPDATE "todos" SET "ownerId" = (SELECT "id" FROM "users" WHERE "email" = 'demo@example.com')`);
        await queryRunner.query(`ALTER TABLE "todos" ALTER COLUMN "ownerId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "todos" ADD CONSTRAINT "FK_035a0825545d08b34ad2b766d3a" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`);
        await queryRunner.query(`ALTER TABLE "todos" DROP CONSTRAINT "FK_035a0825545d08b34ad2b766d3a"`);
        await queryRunner.query(`ALTER TABLE "todos" DROP COLUMN "ownerId"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
