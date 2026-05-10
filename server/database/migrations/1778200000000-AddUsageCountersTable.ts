import {
  type MigrationInterface,
  type QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class AddUsageCountersTable1778200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        schema: 'public',
        name: 'usage_counters',
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
            isUnique: true,
          },
          {
            name: 'short_url_count',
            type: 'integer',
            isNullable: false,
            default: 0,
          },
          {
            name: 'qr_code_count',
            type: 'integer',
            isNullable: false,
            default: 0,
          },
          {
            name: 'primary_link_count',
            type: 'integer',
            isNullable: false,
            default: 0,
          },
          {
            name: 'secondary_link_count',
            type: 'integer',
            isNullable: false,
            default: 0,
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
        ],
        uniques: [
          new TableUnique({
            name: 'usage_counters_id_unique',
            columnNames: ['id'],
          }),
          new TableUnique({
            name: 'usage_counters_user_id_unique',
            columnNames: ['user_id'],
          }),
        ],
        indices: [
          new TableIndex({
            name: 'idx_usage_counters_id',
            columnNames: ['id'],
            isUnique: true,
          }),
          new TableIndex({
            name: 'idx_usage_counters_user_id',
            columnNames: ['user_id'],
            isUnique: true,
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'fk_usage_counters_user_id',
            columnNames: ['user_id'],
            referencedSchema: 'user_management',
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
      true,
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('public.usage_counters', true, true, true);
  }
}
