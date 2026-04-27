import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { EEnvironment } from '~~/enums';

export default async function getFileUrl(key: string) {
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

  const command = new GetObjectCommand({
    Bucket: storage.bucket,
    Key: key,
  });

  const url = await getSignedUrl(client, command, {
    expiresIn: 60 * 5, // 5 minutes
  });

  return url;
}
