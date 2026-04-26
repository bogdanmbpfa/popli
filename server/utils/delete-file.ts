import { Storage } from '@google-cloud/storage';

export default async function deleteFile(fileName: string) {
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
    await file.delete();
  } catch (error) {
    log.error({ message: `Error deleting file: ${fileName}`, error });
    throw error;
  }
}
