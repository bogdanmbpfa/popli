import { desc, eq } from 'drizzle-orm';

import { billingTransactionModel, db } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const { id: userId } = await isAuthenticated(event);

  const transactions = await db.query.billingTransactionModel.findMany({
    where: eq(billingTransactionModel.userId, userId),
    orderBy: [desc(billingTransactionModel.createdAt)],
  });

  return transactions.map((transaction) => ({
    id: transaction.id,
    status: transaction.status,
    currency: transaction.currency,
    amount: transaction.amount,
    periodStart: transaction.periodStart
      ? transaction.periodStart.toISOString()
      : null,
    periodEnd: transaction.periodEnd ? transaction.periodEnd.toISOString() : null,
    paidAt: transaction.paidAt ? transaction.paidAt.toISOString() : null,
    createdAt: transaction.createdAt.toISOString(),
  }));
});
