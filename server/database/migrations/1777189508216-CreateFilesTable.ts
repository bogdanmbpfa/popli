import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateFilesTable1777189508216 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'files',
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
            name: 'path',
            type: 'varchar',
            isNullable: false,
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
      }),
    );

    await queryRunner.query(`
      UPDATE user_management.profiles SET profile_image = NULL, cover_image = NULL WHERE profile_image IS NOT NULL OR cover_image IS NOT NULL;

      ALTER TABLE user_management.profiles RENAME COLUMN profile_image TO profile_image_id;
      ALTER TABLE user_management.profiles RENAME COLUMN cover_image TO cover_image_id;
      ALTER TABLE user_management.profiles ALTER COLUMN profile_image_id TYPE uuid USING NULLIF(profile_image_id, '')::uuid;
      ALTER TABLE user_management.profiles ALTER COLUMN cover_image_id TYPE uuid USING NULLIF(cover_image_id, '')::uuid;
    `);

    await queryRunner.createForeignKeys('user_management.profiles', [
      new TableForeignKey({
        name: 'fk_profiles_profile_image_id',
        columnNames: ['profile_image_id'],
        referencedTableName: 'files',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        name: 'fk_profiles_cover_image_id',
        columnNames: ['cover_image_id'],
        referencedTableName: 'files',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    ]);

    await queryRunner.query(`
      UPDATE url_management.links SET background_image = NULL WHERE background_image IS NOT NULL;

      ALTER TABLE url_management.links RENAME COLUMN background_image TO background_image_id;
      ALTER TABLE url_management.links ALTER COLUMN background_image_id TYPE uuid USING NULLIF(background_image_id, '')::uuid;
    `);

    await queryRunner.createForeignKeys('url_management.links', [
      new TableForeignKey({
        name: 'fk_links_background_image_id',
        columnNames: ['background_image_id'],
        referencedTableName: 'files',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    ]);

    await queryRunner.query(`
      UPDATE qr_code_management.qr_codes SET image_url = NULL WHERE image_url IS NOT NULL;

      ALTER TABLE qr_code_management.qr_codes RENAME COLUMN image_url TO image_id;
      ALTER TABLE qr_code_management.qr_codes ALTER COLUMN image_id TYPE uuid USING NULLIF(image_id, '')::uuid;
    `);

    await queryRunner.createForeignKeys('qr_code_management.qr_codes', [
      new TableForeignKey({
        name: 'fk_qr_codes_image_id',
        columnNames: ['image_id'],
        referencedTableName: 'files',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('files');
  }
}
