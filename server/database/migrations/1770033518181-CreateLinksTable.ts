import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

const ELinkType = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
} as const;

const ELinkPlatform = {
  X: 'x',
  INSTAGRAM: 'instagram',
  TIKTOK: 'tiktok',
  YOUTUBE: 'youtube',
  FACEBOOK: 'facebook',
  LINKEDIN: 'linkedin',
  GITHUB: 'github',
  TWITCH: 'twitch',
  DISCORD: 'discord',
};

export class CreateLinksTable1770033518181 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE link_type AS ENUM ('${Object.values(ELinkType).join("', '")}');
      CREATE TYPE link_platform AS ENUM ('${Object.values(ELinkPlatform).join("', '")}');
    `);

    await queryRunner.createTable(
      new Table({
        schema: 'url_management',
        name: 'links',
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
            name: 'type',
            type: 'link_type',
            enum: Object.values(ELinkType),
            enumName: 'link_type',
            isNullable: false,
          },
          {
            name: 'platform',
            type: 'link_platform',
            enum: Object.values(ELinkPlatform),
            enumName: 'link_platform',
            isNullable: true,
          },
          {
            name: 'url',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'background_image',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'title_colors',
            type: 'jsonb',
            isNullable: true,
            default: "'[]'",
          },
          {
            name: 'background_colors',
            type: 'jsonb',
            isNullable: true,
            default: "'[]'",
          },
          {
            name: 'position',
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
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        uniques: [
          new TableUnique({
            name: 'uq_links_id',
            columnNames: ['id'],
          }),
        ],
        indices: [
          new TableIndex({
            name: 'idx_links_id',
            columnNames: ['id'],
            isUnique: true,
          }),
          new TableIndex({
            name: 'idx_links_user_id',
            columnNames: ['user_id'],
          }),
          new TableIndex({
            name: 'idx_links_type',
            columnNames: ['type'],
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'fk_links_user_id',
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

    await queryRunner.createTable(
      new Table({
        schema: 'url_management',
        name: 'link_clicks',
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
            name: 'link_id',
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
            name: 'uq_link_clicks_id',
            columnNames: ['id'],
          }),
        ],
        indices: [
          new TableIndex({
            name: 'idx_link_clicks_id',
            columnNames: ['id'],
            isUnique: true,
          }),
          new TableIndex({
            name: 'idx_link_clicks_link_id',
            columnNames: ['link_id'],
          }),
          new TableIndex({
            name: 'idx_link_clicks_ip_address',
            columnNames: ['ip_address'],
          }),
          new TableIndex({
            name: 'idx_link_clicks_country',
            columnNames: ['country'],
          }),
          new TableIndex({
            name: 'idx_link_clicks_country_code',
            columnNames: ['country_code'],
          }),
          new TableIndex({
            name: 'idx_link_clicks_user_agent',
            columnNames: ['user_agent'],
          }),
          new TableIndex({
            name: 'idx_link_clicks_device_type',
            columnNames: ['device_type'],
          }),
          new TableIndex({
            name: 'idx_link_clicks_browser',
            columnNames: ['browser'],
          }),
          new TableIndex({
            name: 'idx_link_clicks_os',
            columnNames: ['os'],
          }),
          new TableIndex({
            name: 'idx_link_clicks_referrer',
            columnNames: ['referrer'],
          }),
          new TableIndex({
            name: 'idx_link_clicks_clicked_at',
            columnNames: ['clicked_at'],
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'fk_link_clicks_link_id',
            columnNames: ['link_id'],
            referencedSchema: 'url_management',
            referencedTableName: 'links',
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
    await queryRunner.dropTable('url_management.link_clicks', true, true, true);
    await queryRunner.dropTable('url_management.links', true, true, true);
    await queryRunner.query(`
      DROP TYPE link_type;
      DROP TYPE link_platform;
    `);
  }
}
