import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateProfileAccessTable1774966805106 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'profile_access',
        schema: 'user_management',
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
            name: 'ip_address',
            type: 'inet',
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
            name: 'user_agent',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'accessed_at',
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
        indices: [
          new TableIndex({
            name: 'idx_profile_access_id',
            columnNames: ['id'],
            isUnique: true,
          }),
          new TableIndex({
            name: 'idx_profile_access_user_id',
            columnNames: ['user_id'],
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'fk_profile_access_user_id',
            columnNames: ['user_id'],
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
    await queryRunner.dropTable(
      'user_management.profile_access',
      true,
      true,
      true,
    );
  }
}
