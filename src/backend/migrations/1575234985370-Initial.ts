import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1575234985370 implements MigrationInterface {
  name = "Initial1575234985370";

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "captcha" ("id" varchar PRIMARY KEY NOT NULL, "solution" varchar NOT NULL, "createdAt" integer NOT NULL DEFAULT (1575234985))`,
      undefined
    );
    await queryRunner.query(
      `CREATE TABLE "record" ("id" integer NOT NULL, "sessionId" varchar NOT NULL, "registeredMembersCount" integer NOT NULL, "activeMembersCount" integer NOT NULL, "understandingMembersCount" integer NOT NULL, "time" integer NOT NULL DEFAULT (1575234985), PRIMARY KEY ("id", "sessionId"))`,
      undefined
    );
    await queryRunner.query(
      `CREATE TABLE "session" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "key" varchar NOT NULL, "captchaRequired" boolean NOT NULL, "createdAt" integer NOT NULL DEFAULT (1575234985))`,
      undefined
    );
    await queryRunner.query(
      `CREATE TABLE "member" ("id" varchar NOT NULL, "sessionId" varchar NOT NULL, "secret" varchar NOT NULL, "understanding" boolean NOT NULL, "createdAt" integer NOT NULL DEFAULT (1575234985), "lastPingTime" integer NOT NULL DEFAULT (1575234985), PRIMARY KEY ("id", "sessionId"))`,
      undefined
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fb5410e852ad2bbbec460d6cb7" ON "member" ("id", "sessionId") `,
      undefined
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_record" ("id" integer NOT NULL, "sessionId" varchar NOT NULL, "registeredMembersCount" integer NOT NULL, "activeMembersCount" integer NOT NULL, "understandingMembersCount" integer NOT NULL, "time" integer NOT NULL DEFAULT (1575234985), CONSTRAINT "FK_af3d276697c37892c98e8e04927" FOREIGN KEY ("sessionId") REFERENCES "session" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, PRIMARY KEY ("id", "sessionId"))`,
      undefined
    );
    await queryRunner.query(
      `INSERT INTO "temporary_record"("id", "sessionId", "registeredMembersCount", "activeMembersCount", "understandingMembersCount", "time") SELECT "id", "sessionId", "registeredMembersCount", "activeMembersCount", "understandingMembersCount", "time" FROM "record"`,
      undefined
    );
    await queryRunner.query(`DROP TABLE "record"`, undefined);
    await queryRunner.query(`ALTER TABLE "temporary_record" RENAME TO "record"`, undefined);
    await queryRunner.query(`DROP INDEX "IDX_fb5410e852ad2bbbec460d6cb7"`, undefined);
    await queryRunner.query(
      `CREATE TABLE "temporary_member" ("id" varchar NOT NULL, "sessionId" varchar NOT NULL, "secret" varchar NOT NULL, "understanding" boolean NOT NULL, "createdAt" integer NOT NULL DEFAULT (1575234985), "lastPingTime" integer NOT NULL DEFAULT (1575234985), CONSTRAINT "FK_0fccea52f3babbfb88b62b4d0dd" FOREIGN KEY ("sessionId") REFERENCES "session" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, PRIMARY KEY ("id", "sessionId"))`,
      undefined
    );
    await queryRunner.query(
      `INSERT INTO "temporary_member"("id", "sessionId", "secret", "understanding", "createdAt", "lastPingTime") SELECT "id", "sessionId", "secret", "understanding", "createdAt", "lastPingTime" FROM "member"`,
      undefined
    );
    await queryRunner.query(`DROP TABLE "member"`, undefined);
    await queryRunner.query(`ALTER TABLE "temporary_member" RENAME TO "member"`, undefined);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fb5410e852ad2bbbec460d6cb7" ON "member" ("id", "sessionId") `,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP INDEX "IDX_fb5410e852ad2bbbec460d6cb7"`, undefined);
    await queryRunner.query(`ALTER TABLE "member" RENAME TO "temporary_member"`, undefined);
    await queryRunner.query(
      `CREATE TABLE "member" ("id" varchar NOT NULL, "sessionId" varchar NOT NULL, "secret" varchar NOT NULL, "understanding" boolean NOT NULL, "createdAt" integer NOT NULL DEFAULT (1575234985), "lastPingTime" integer NOT NULL DEFAULT (1575234985), PRIMARY KEY ("id", "sessionId"))`,
      undefined
    );
    await queryRunner.query(
      `INSERT INTO "member"("id", "sessionId", "secret", "understanding", "createdAt", "lastPingTime") SELECT "id", "sessionId", "secret", "understanding", "createdAt", "lastPingTime" FROM "temporary_member"`,
      undefined
    );
    await queryRunner.query(`DROP TABLE "temporary_member"`, undefined);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fb5410e852ad2bbbec460d6cb7" ON "member" ("id", "sessionId") `,
      undefined
    );
    await queryRunner.query(`ALTER TABLE "record" RENAME TO "temporary_record"`, undefined);
    await queryRunner.query(
      `CREATE TABLE "record" ("id" integer NOT NULL, "sessionId" varchar NOT NULL, "registeredMembersCount" integer NOT NULL, "activeMembersCount" integer NOT NULL, "understandingMembersCount" integer NOT NULL, "time" integer NOT NULL DEFAULT (1575234985), PRIMARY KEY ("id", "sessionId"))`,
      undefined
    );
    await queryRunner.query(
      `INSERT INTO "record"("id", "sessionId", "registeredMembersCount", "activeMembersCount", "understandingMembersCount", "time") SELECT "id", "sessionId", "registeredMembersCount", "activeMembersCount", "understandingMembersCount", "time" FROM "temporary_record"`,
      undefined
    );
    await queryRunner.query(`DROP TABLE "temporary_record"`, undefined);
    await queryRunner.query(`DROP INDEX "IDX_fb5410e852ad2bbbec460d6cb7"`, undefined);
    await queryRunner.query(`DROP TABLE "member"`, undefined);
    await queryRunner.query(`DROP TABLE "session"`, undefined);
    await queryRunner.query(`DROP TABLE "record"`, undefined);
    await queryRunner.query(`DROP TABLE "captcha"`, undefined);
  }
}
