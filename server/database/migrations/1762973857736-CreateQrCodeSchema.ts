import {
  type MigrationInterface,
  type QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

const EQRCodeDataType = {
  TEXT: 'text',
  URL: 'url',
  EMAIL: 'email',
  PHONE: 'phone',
} as const;

export class CreateQrCodeSchema1762973857736 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createSchema('qr_code_management', true);

    await queryRunner.query(
      `CREATE TYPE "qr_code_data_type" AS ENUM ('${Object.values(EQRCodeDataType).join("', '")}');`,
    );

    await queryRunner.createTable(
      new Table({
        name: 'qr_codes',
        schema: 'qr_code_management',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'uuidv7()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'image_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'data_type',
            type: 'qr_code_data_type',
            enum: Object.values(EQRCodeDataType),
            enumName: 'qr_code_data_type',
            isNullable: false,
          },
          {
            name: 'options',
            type: 'jsonb',
            isNullable: false,
            default: "'{}'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        uniques: [
          new TableUnique({
            columnNames: ['id'],
            name: 'qr_codes_id_unique',
          }),
        ],
        indices: [
          new TableIndex({
            columnNames: ['id'],
            name: 'idx_qr_codes_id',
            isUnique: true,
          }),
          new TableIndex({
            columnNames: ['user_id'],
            name: 'idx_qr_codes_user_id',
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'fk_qr_codes_user_id',
            columnNames: ['user_id'],
            referencedSchema: 'user_management',
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'qr_code_scans',
        schema: 'qr_code_management',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'uuidv7()',
          },
          {
            name: 'qr_code_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'country',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'country_code',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'user_agent',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'device_type',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'browser',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'os',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'referrer',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'scanned_at',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
        ],
        uniques: [
          new TableUnique({
            columnNames: ['id'],
            name: 'qr_code_scans_id_unique',
          }),
        ],
        indices: [
          new TableIndex({
            columnNames: ['id'],
            name: 'idx_qr_code_scans_id',
            isUnique: true,
          }),
          new TableIndex({
            columnNames: ['qr_code_id'],
            name: 'idx_qr_code_scans_qr_code_id',
          }),
          new TableIndex({
            columnNames: ['user_id'],
            name: 'idx_qr_code_scans_user_id',
          }),
          new TableIndex({
            columnNames: ['country'],
            name: 'idx_qr_code_scans_country',
          }),
          new TableIndex({
            columnNames: ['device_type'],
            name: 'idx_qr_code_scans_device_type',
          }),
          new TableIndex({
            columnNames: ['browser'],
            name: 'idx_qr_code_scans_browser',
          }),
          new TableIndex({
            columnNames: ['os'],
            name: 'idx_qr_code_scans_os',
          }),
          new TableIndex({
            columnNames: ['referrer'],
            name: 'idx_qr_code_scans_referrer',
          }),
          new TableIndex({
            columnNames: ['scanned_at'],
            name: 'idx_qr_code_scans_scanned_at',
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'fk_qr_code_scans_qr_code_id',
            columnNames: ['qr_code_id'],
            referencedSchema: 'qr_code_management',
            referencedTableName: 'qr_codes',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            name: 'fk_qr_code_scans_user_id',
            columnNames: ['user_id'],
            referencedSchema: 'user_management',
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(
      'qr_code_management.qr_code_scans',
      true,
      true,
      true,
    );
    await queryRunner.dropTable(
      'qr_code_management.qr_codes',
      true,
      true,
      true,
    );
    await queryRunner.dropSchema('qr_code_management', true);
    await queryRunner.query('DROP TYPE "qr_code_data_type";');
  }
}
