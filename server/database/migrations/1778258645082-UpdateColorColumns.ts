import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateColorColumns1778258645082 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE user_management.profiles ALTER COLUMN handle_color TYPE VARCHAR(7);
      ALTER TABLE user_management.profiles ALTER COLUMN bio_color TYPE VARCHAR(7);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE user_management.profiles ALTER COLUMN handle_color TYPE VARCHAR(6);
      ALTER TABLE user_management.profiles ALTER COLUMN bio_color TYPE VARCHAR(6);
    `);
  }
}
