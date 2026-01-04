import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class UpdateImageColumns1766765015954 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE user_management.users ALTER COLUMN profile_image TYPE varchar(255);
      ALTER TABLE user_management.users ALTER COLUMN cover_image TYPE varchar(255);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE user_management.users ALTER COLUMN profile_image TYPE varchar(40);
      ALTER TABLE user_management.users ALTER COLUMN cover_image TYPE varchar(40);
    `);
  }
}
