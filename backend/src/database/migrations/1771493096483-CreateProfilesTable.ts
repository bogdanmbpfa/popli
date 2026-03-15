import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class CreateProfilesTable1771493096483 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        schema: 'user_management',
        name: 'profiles',
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
            name: 'handle',
            type: 'varchar',
            length: '40',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'profile_image',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'cover_image',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'handle_color',
            type: 'varchar',
            length: '6',
            isNullable: true,
          },
          {
            name: 'bio',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'bio_color',
            type: 'varchar',
            length: '6',
            isNullable: true,
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
        foreignKeys: [
          {
            name: 'fk_profiles_user_id',
            referencedSchema: 'user_management',
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            columnNames: ['user_id'],
            onDelete: 'CASCADE',
          },
        ],
        uniques: [
          new TableUnique({
            columnNames: ['id'],
            name: 'profiles_id_unique',
          }),
          new TableUnique({
            columnNames: ['user_id'],
            name: 'profiles_user_id_unique',
          }),
          new TableUnique({
            columnNames: ['handle'],
            name: 'profiles_handle_unique',
          }),
        ],
        indices: [
          new TableIndex({
            columnNames: ['id'],
            name: 'idx_profiles_id',
          }),
          new TableIndex({
            columnNames: ['user_id'],
            name: 'idx_profiles_user_id',
          }),
          new TableIndex({
            columnNames: ['handle'],
            name: 'idx_profiles_handle',
          }),
        ],
      }),
      true,
      true,
      true,
    );

    const users = await queryRunner.query(
      'SELECT * FROM user_management.users;',
    );

    await queryRunner.query(
      `
			INSERT INTO user_management.profiles (user_id, handle, name, profile_image, cover_image, bio)
			VALUES ${users.map((user) => `('${user.id}', '${user.handle}', '${user.name}', ${user.profile_image ? `${user.profile_image}` : null}, ${user.cover_image ? `${user.cover_image}` : null}, ${user.bio ? `${user.bio}` : null})`).join(', ')};
		`,
    );

    await queryRunner.dropColumns('user_management.users', [
      'handle',
      'name',
      'profile_image',
      'cover_image',
      'bio',
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('user_management.users', [
      new TableColumn({
        name: 'handle',
        type: 'varchar',
        length: '40',
        isNullable: true,
      }),
      new TableColumn({
        name: 'name',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'profile_image',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'cover_image',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'bio',
        type: 'text',
        isNullable: true,
      }),
    ]);

    const profiles = await queryRunner.query(
      'SELECT * FROM user_management.profiles;',
    );

    for (const profile of profiles) {
      await queryRunner.query(
        'UPDATE user_management.users SET handle = $1, name = $2, profile_image = $3, cover_image = $4, bio = $5 WHERE id = $6',
        [
          profile.handle,
          profile.name,
          profile.profile_image ? `'${profile.profile_image}'` : null,
          profile.cover_image ? `'${profile.cover_image}'` : null,
          profile.bio ? `'${profile.bio}'` : null,
          profile.user_id,
        ],
      );
    }

    await queryRunner.query(`
      ALTER TABLE user_management.users ALTER COLUMN handle SET NOT NULL;
      ALTER TABLE user_management.users ALTER COLUMN name SET NOT NULL;
    `);

    await queryRunner.createUniqueConstraint(
      'user_management.users',
      new TableUnique({
        columnNames: ['handle'],
        name: 'users_handle_unique',
      }),
    );

    await queryRunner.dropTable('user_management.profiles', true, true, true);
  }
}
