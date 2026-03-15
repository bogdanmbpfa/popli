import { randomBytes } from 'crypto';
import {
  type MigrationInterface,
  type QueryRunner,
  Table,
  TableColumn,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class AddRefreshTokenColumns1767018821352 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('user_management.users', [
      new TableColumn({
        name: 'refresh_token_secret',
        type: 'varchar',
        length: '40',
        isNullable: true,
      }),
    ]);

    const users = await queryRunner.query(
      'SELECT id FROM user_management.users;',
    );

    for (const user of users) {
      const refreshTokenSecret = randomBytes(20).toString('hex').toUpperCase();

      await queryRunner.query(
        'UPDATE user_management.users SET refresh_token_secret = $1 WHERE id = $2',
        [refreshTokenSecret, user.id],
      );
    }

    await queryRunner.query(
      'ALTER TABLE user_management.users ALTER COLUMN refresh_token_secret SET NOT NULL',
    );

    await queryRunner.createUniqueConstraint(
      'user_management.users',
      new TableUnique({
        columnNames: ['refresh_token_secret'],
        name: 'uq_users_refresh_token_secret',
      }),
    );

    await queryRunner.createTable(
      new Table({
        schema: 'user_management',
        name: 'auth_sessions',
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
            name: 'refresh_token',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'ip_address',
            type: 'inet',
            isNullable: false,
          },
          {
            name: 'user_agent',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            name: 'fk_auth_sessions_user_id',
            referencedSchema: 'user_management',
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            columnNames: ['user_id'],
            onDelete: 'CASCADE',
          },
        ],
        uniques: [
          new TableUnique({
            columnNames: ['refresh_token'],
            name: 'uq_auth_sessions_refresh_token',
          }),
          new TableUnique({
            columnNames: ['ip_address'],
            name: 'uq_auth_sessions_ip_address',
          }),
        ],
        indices: [
          new TableIndex({
            columnNames: ['user_id'],
            name: 'idx_auth_sessions_user_id',
          }),
          new TableIndex({
            columnNames: ['ip_address'],
            name: 'idx_auth_sessions_ip_address',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_management.auth_sessions');
    await queryRunner.dropColumn(
      'user_management.users',
      'refresh_token_secret',
    );
  }
}
