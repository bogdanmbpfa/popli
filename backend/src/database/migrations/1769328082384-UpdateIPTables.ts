import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateIPTables1769328082384 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE url_management.short_url_clicks ALTER COLUMN ip_address TYPE inet USING ip_address::inet;
      ALTER TABLE qr_code_management.qr_code_scans ALTER COLUMN ip_address TYPE inet USING ip_address::inet;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE url_management.short_url_clicks ALTER COLUMN ip_address TYPE varchar(40);
      ALTER TABLE qr_code_management.qr_code_scans ALTER COLUMN ip_address TYPE varchar(40);
    `);
  }
}
