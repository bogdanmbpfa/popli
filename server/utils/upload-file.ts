import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { log } from 'evlog';
import { randomBytes } from 'node:crypto';
import { stat, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { v7 as uuidv7 } from 'uuid';

import { EEnvironment } from '~~/enums';

export default async function uploadFile(
  userId: string,
  buffer: Buffer,
  name: string,
  mimetype: string,
  folder?: string,
) {
  const {
    public: { nodeEnv },
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

  const key = `user/${userId}/${uuidv7()}.${mimetype.split('/')[1]}`;

  const command = new PutObjectCommand({
    Bucket: storage.bucket,
    Key: key,
    ContentType: mimetype,
  });

  try {
    const url = await getSignedUrl(client, command, {
      expiresIn: 60, // seconds
    });

    return { url, key };
  } catch (error) {
    log.error({ message: 'Error getting signed URL for file', error });

    throw error;
  }
}
