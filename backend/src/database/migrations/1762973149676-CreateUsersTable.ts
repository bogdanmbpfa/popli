import {
  type MigrationInterface,
  type QueryRunner,
  Table,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class CreateUsersTable1762973149676 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createSchema('user_management', true);

    await queryRunner.createTable(
      new Table({
        name: 'users',
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
            name: 'email',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'handle',
            type: 'varchar',
            length: '40',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'profile_image',
            type: 'varchar',
            length: '40',
            isNullable: true,
          },
          {
            name: 'cover_image',
            type: 'varchar',
            length: '40',
            isNullable: true,
          },
          {
            name: 'bio',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'email_confirmation_code',
            type: 'varchar',
            length: '6',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'email_confirmation_code_expires_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'email_confirmed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'password_reset_code',
            type: 'varchar',
            length: '6',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'password_reset_code_expires_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'jwt_secret',
            type: 'varchar',
            length: '40',
            isNullable: false,
            isUnique: true,
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
            name: 'users_id_unique',
          }),
          new TableUnique({
            columnNames: ['email'],
            name: 'users_email_unique',
          }),
          new TableUnique({
            columnNames: ['password'],
            name: 'users_password_unique',
          }),
          new TableUnique({
            columnNames: ['handle'],
            name: 'users_handle_unique',
          }),
          new TableUnique({
            columnNames: ['email_confirmation_code'],
            name: 'users_email_confirmation_code_unique',
          }),
          new TableUnique({
            columnNames: ['password_reset_code'],
            name: 'users_password_reset_code_unique',
          }),
          new TableUnique({
            columnNames: ['jwt_secret'],
            name: 'users_jwt_secret_unique',
          }),
        ],
        indices: [
          new TableIndex({
            columnNames: ['email'],
            name: 'idx_users_email',
          }),
          new TableIndex({
            columnNames: ['handle'],
            name: 'idx_users_handle',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_management.users', true, true, true);
    await queryRunner.dropSchema('user_management', true);
  }
}
