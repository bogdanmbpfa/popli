import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v7 as uuidv7 } from 'uuid';

import { EEnvironment } from '~~/enums';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages, nodeEnv },
    storage,
  } = useRuntimeConfig();

  const client = new S3Client({
    region: storage.region,
    credentials: {
      accessKeyId: storage.accessKeyId,
      secretAccessKey: storage.secretAccessKey,
    },
    endpoint: storage.endpoint,
    forcePathStyle: nodeEnv === EEnvironment.LOCAL,
  });

  const { id } = await isAuthenticated(event);

  const { fileName, contentType } = await readBody(event);

  const key = `user/${id}/${uuidv7()}_${fileName}`;

  const command = new PutObjectCommand({
    Bucket: storage.bucket,
    Key: key,
    ContentType: contentType,
  });

  try {
    const url = await getSignedUrl(client, command, {
      expiresIn: 60 * 5, // 5 minutes
    });

    return { url, key };
  } catch (error) {
    log.error({ message: 'Error getting signed URL for file', error });

    throw createError({
      statusCode: 500,
      statusMessage: 'Error getting signed URL for file',
      message: errorMessages.internalServerError,
    });
  }
});
