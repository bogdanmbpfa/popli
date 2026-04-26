import { Storage } from '@google-cloud/storage';

export default async function getFileBuffer(fileName: string) {
  const { googleCloud } = useRuntimeConfig();

  const client = new Storage({
    projectId: googleCloud.projectId,
    universeDomain: 'googleapis.com',
    credentials: {
      type: 'service_account',
      project_id: googleCloud.projectId,
      client_email: googleCloud.storage.serviceAccountEmail,
      private_key: googleCloud.storage.serviceAccountKey.replace(/\\n/g, '\n'),
    },
  });
  const bucket = client.bucket(googleCloud.storage.bucket);

  try {
    const file = bucket.file(fileName);
    const [exists] = await file.exists();

    if (!exists) {
      log.error({ message: `File ${fileName} does not exist in bucket` });
      throw new Error(`File ${fileName} does not exist in bucket`);
    }

    const [buffer] = await file.download();
    
    return buffer;
  } catch (error) {
    log.error({ message: `Error getting buffer for file: ${fileName}`, error });

    throw error;
  }
}
