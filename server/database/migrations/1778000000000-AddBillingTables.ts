import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

enum EPlanType {
  FREE = 'free',
  PRO = 'pro',
}

export class AddBillingTables1778000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE plan_type AS ENUM ('${Object.values(EPlanType).join(
        "', '",
      )}');
      COMMIT;
    `);

    await queryRunner.addColumns('user_management.users', [
      new TableColumn({
        name: 'plan',
        type: 'plan_type',
        enum: Object.values(EPlanType),
        enumName: 'plan_type',
        isNullable: false,
        default: `'${EPlanType.FREE}'`,
      }),
      new TableColumn({
        name: 'plan_started_at',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'plan_ends_at',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'stripe_customer_id',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'stripe_subscription_id',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    ]);

    await queryRunner.createIndex(
      'user_management.users',
      new TableIndex({
        name: 'idx_users_stripe_customer_id',
        columnNames: ['stripe_customer_id'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'user_management.users',
      new TableIndex({
        name: 'idx_users_stripe_subscription_id',
        columnNames: ['stripe_subscription_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createTable(
      new Table({
        schema: 'user_management',
        name: 'billing_transactions',
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
            name: 'stripe_event_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'stripe_invoice_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'stripe_checkout_session_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'stripe_subscription_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '32',
            isNullable: false,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '8',
            isNullable: false,
          },
          {
            name: 'amount',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'period_start',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'period_end',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'paid_at',
            type: 'timestamp',
            isNullable: true,
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
            name: 'uq_billing_transactions_id',
            columnNames: ['id'],
          }),
          new TableUnique({
            name: 'uq_billing_transactions_stripe_invoice_id',
            columnNames: ['stripe_invoice_id'],
          }),
          new TableUnique({
            name: 'uq_billing_transactions_checkout_session_id',
            columnNames: ['stripe_checkout_session_id'],
          }),
        ],
        indices: [
          new TableIndex({
            name: 'idx_billing_transactions_id',
            columnNames: ['id'],
            isUnique: true,
          }),
          new TableIndex({
            name: 'idx_billing_transactions_user_id',
            columnNames: ['user_id'],
          }),
          new TableIndex({
            name: 'idx_billing_transactions_stripe_event_id',
            columnNames: ['stripe_event_id'],
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'fk_billing_transactions_user_id',
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
        schema: 'user_management',
        name: 'billing_webhook_events',
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
            name: 'stripe_event_id',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'event_type',
            type: 'varchar',
            length: '128',
            isNullable: false,
          },
          {
            name: 'payload',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'processed_at',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
        ],
        uniques: [
          new TableUnique({
            name: 'uq_billing_webhook_events_id',
            columnNames: ['id'],
          }),
          new TableUnique({
            name: 'uq_billing_webhook_events_stripe_event_id',
            columnNames: ['stripe_event_id'],
          }),
        ],
        indices: [
          new TableIndex({
            name: 'idx_billing_webhook_events_id',
            columnNames: ['id'],
            isUnique: true,
          }),
          new TableIndex({
            name: 'idx_billing_webhook_events_stripe_event_id',
            columnNames: ['stripe_event_id'],
            isUnique: true,
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
      'user_management.billing_webhook_events',
      true,
      true,
      true,
    );
    await queryRunner.dropTable(
      'user_management.billing_transactions',
      true,
      true,
      true,
    );

    await queryRunner.query(`
      DROP INDEX IF EXISTS user_management.idx_users_stripe_subscription_id;
      DROP INDEX IF EXISTS user_management.idx_users_stripe_customer_id;
    `);

    await queryRunner.query(`
      ALTER TABLE user_management.users
      DROP COLUMN IF EXISTS stripe_subscription_id,
      DROP COLUMN IF EXISTS stripe_customer_id,
      DROP COLUMN IF EXISTS plan_ends_at,
      DROP COLUMN IF EXISTS plan_started_at,
      DROP COLUMN IF EXISTS plan;
      DROP TYPE IF EXISTS plan_type;
    `);
  }
}
