import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDeletedAtToQrCodeScansTable1776761284340 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'qr_code_management.qr_code_scans',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamp',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'qr_code_management.qr_code_scans',
      'deleted_at',
    );
  }
}
