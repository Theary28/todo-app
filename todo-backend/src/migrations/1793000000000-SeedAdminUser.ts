import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedAdminUser1793000000000 implements MigrationInterface {
    name = 'SeedAdminUser1793000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Signup always creates role 'user', so the first admin is seeded here (password: admin12345).
        // Change the password before deploying anywhere real.
        await queryRunner.query(`INSERT INTO "users" ("email", "passwordHash", "role") VALUES ('admin@example.com', '$argon2id$v=19$m=65536,p=4,t=3$mcsz7HrtyejagVK4xg5lSw$IS5ckJLNXfFgj9iLjSeYc0pxefwkMpsRYDgq7aoY0bU', 'admin') ON CONFLICT ("email") DO UPDATE SET "role" = 'admin'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "users" WHERE "email" = 'admin@example.com'`);
    }

}
