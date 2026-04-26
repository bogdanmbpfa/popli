import { Storage } from '@google-cloud/storage';
import { log } from 'evlog';
import { randomBytes } from 'node:crypto';
import { stat, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export default async function uploadFile(
  buffer: Buffer,
  name: string,
  mimetype: string,
  folder?: string,
) {
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

  const filepath = join(
    tmpdir(),
    `${randomBytes(16).toString('hex')}.${mimetype.split('/')[1]}`,
  );

  try {
    await writeFile(filepath, buffer);

    log.info({
      message: `Uploading file to Google Cloud Storage: ${filepath}`,
    });

    const [file] = await bucket.upload(filepath, {
      destination: `${folder ? `${folder}/` : ''}${name}`,
      metadata: {
        contentType: mimetype,
      },
    });

    return file.metadata.name!;
  } catch (error) {
    log.error({
      message: `Error uploading file to Google Cloud Storage`,
      error,
    });

    throw error;
  } finally {
    if (await stat(filepath).catch(() => false)) {
      await unlink(filepath);
    }
  }
}
