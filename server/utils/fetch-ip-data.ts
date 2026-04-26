import { EEnvironment } from '~~/enums';
import type { IUrlIpApiResponse, IUrlIpData } from '~~/interfaces';

export default async function fetchIpData(ip: string): Promise<IUrlIpData> {
  const {
    public: { nodeEnv, errorMessages },
  } = useRuntimeConfig();

  if (nodeEnv === EEnvironment.LOCAL) {
    return {
      ipAddress: ip || '127.0.0.1',
      countryName: 'Romania',
      countryCode: 'RO',
      isProxy: false,
    };
  }

  try {
    const data = await $fetch<IUrlIpApiResponse>(
      `https://free.freeipapi.com/api/json/${ip}`,
    );

    if (data.isProxy) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: errorMessages.ipProxy,
      });
    }

    return data;
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.ipProxy,
    });
  }
}
