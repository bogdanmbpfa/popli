import {
  type MigrationInterface,
  type QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class CreateUrlSchema1762973427540 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createSchema('url_management', true);

    await queryRunner.createTable(
      new Table({
        name: 'short_urls',
        schema: 'url_management',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'url',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'short_code',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'alias',
            type: 'varchar',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            isNullable: false,
            default: true,
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
            name: 'short_urls_id_unique',
          }),
          new TableUnique({
            columnNames: ['short_code'],
            name: 'short_urls_short_code_unique',
          }),
          new TableUnique({
            columnNames: ['alias'],
            name: 'short_urls_alias_unique',
          }),
        ],
        indices: [
          new TableIndex({
            columnNames: ['id'],
            name: 'idx_short_urls_id',
            isUnique: true,
          }),
          new TableIndex({
            columnNames: ['user_id'],
            name: 'idx_short_urls_user_id',
          }),
          new TableIndex({
            columnNames: ['short_code'],
            name: 'idx_short_urls_short_code',
            isUnique: true,
          }),
          new TableIndex({
            columnNames: ['alias'],
            name: 'idx_short_urls_alias',
            isUnique: true,
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'fk_short_urls_user_id',
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
        name: 'short_url_clicks',
        schema: 'url_management',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'short_url_id',
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
            name: 'clicked_at',
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
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        uniques: [
          new TableUnique({
            columnNames: ['id'],
            name: 'short_url_clicks_id_unique',
          }),
        ],
        indices: [
          new TableIndex({
            columnNames: ['short_url_id'],
            name: 'idx_short_url_clicks_short_url_id',
            isUnique: true,
          }),
          new TableIndex({
            columnNames: ['country'],
            name: 'idx_short_url_clicks_country',
          }),
          new TableIndex({
            columnNames: ['device_type'],
            name: 'idx_short_url_clicks_device_type',
          }),
          new TableIndex({
            columnNames: ['browser'],
            name: 'idx_short_url_clicks_browser',
          }),
          new TableIndex({
            columnNames: ['os'],
            name: 'idx_short_url_clicks_os',
          }),
          new TableIndex({
            columnNames: ['referrer'],
            name: 'idx_short_url_clicks_referrer',
          }),
          new TableIndex({
            columnNames: ['clicked_at'],
            name: 'idx_short_url_clicks_clicked_at',
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'fk_short_url_clicks_short_url_id',
            columnNames: ['short_url_id'],
            referencedSchema: 'url_management',
            referencedTableName: 'short_urls',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(
      'url_management.short_url_clicks',
      true,
      true,
      true,
    );
    await queryRunner.dropTable('url_management.short_urls', true, true, true);
    await queryRunner.dropSchema('url_management', true);
  }
}
