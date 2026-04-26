import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class UpdateShortUrlClicksIndex1774180607881 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'url_management.short_url_clicks',
      'idx_short_url_clicks_short_url_id',
    );

    await queryRunner.createIndex(
      'url_management.short_url_clicks',
      new TableIndex({
        name: 'idx_short_url_clicks_short_url_id',
        columnNames: ['short_url_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'url_management.short_url_clicks',
      'idx_short_url_clicks_short_url_id',
    );

    await queryRunner.createIndex(
      'url_management.short_url_clicks',
      new TableIndex({
        name: 'idx_short_url_clicks_short_url_id',
        columnNames: ['short_url_id'],
        isUnique: true,
      }),
    );
  }
}
