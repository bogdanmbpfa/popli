import { eq } from 'drizzle-orm';

import { db, usageCounterModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const { id: userId } = await isAuthenticated(event);

  const [usageCounters] = await db
    .select({
      shortUrlCount: usageCounterModel.shortUrlCount,
      qrCodeCount: usageCounterModel.qrCodeCount,
      primaryLinkCount: usageCounterModel.primaryLinkCount,
      secondaryLinkCount: usageCounterModel.secondaryLinkCount,
    })
    .from(usageCounterModel)
    .where(eq(usageCounterModel.userId, userId));

  return {
    shortUrlCount: usageCounters?.shortUrlCount ?? 0,
    qrCodeCount: usageCounters?.qrCodeCount ?? 0,
    primaryLinkCount: usageCounters?.primaryLinkCount ?? 0,
    secondaryLinkCount: usageCounters?.secondaryLinkCount ?? 0,
  };
});
