import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { EEnvironment } from '~~/enums';

export default async function deleteFile(key: string) {
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

  const command = new DeleteObjectCommand({
    Bucket: storage.bucket,
    Key: key,
  });

  try {
    await client.send(command);
  } catch (error) {
    log.error({ message: 'Error deleting file', error });

    throw error;
  }
}
