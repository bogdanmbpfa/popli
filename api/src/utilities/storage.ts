import { Bucket, Storage } from '@google-cloud/storage';
import { randomBytes } from 'crypto';
import { stat, unlink, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

import config from '@config';
import { logger } from '@server';

class GoogleCloudStorage {
  private storage: Storage;
  private bucket: Bucket;
  private static _instance: GoogleCloudStorage;

  private constructor() {
    this.storage = new Storage({
      projectId: config.googleCloud.projectId,
      universeDomain: 'googleapis.com',
      credentials: {
        type: 'service_account',
        project_id: config.googleCloud.projectId,
        client_email: config.googleCloud.storage.serviceAccountEmail,
        private_key: config.googleCloud.storage.serviceAccountKey?.replace(
          /\\n/g,
          '\n',
        ),
      },
    });

    this.bucket = this.storage.bucket(config.googleCloud.storage.bucket!);
  }

  public static get instance(): GoogleCloudStorage {
    if (!GoogleCloudStorage._instance) {
      GoogleCloudStorage._instance = new GoogleCloudStorage();
    }

    return GoogleCloudStorage._instance;
  }

  public async upload(
    buffer: Buffer,
    name: string,
    mimetype: string,
    folder?: string,
  ): Promise<string> {
    const filepath = join(
      tmpdir(),
      `${randomBytes(16).toString('hex')}.${mimetype.split('/')[1]}`,
    );

    try {
      await writeFile(filepath, buffer);

      logger.info(`Uploading file to Google Cloud Storage: ${filepath}`);

      const [file] = await this.bucket.upload(filepath, {
        destination: `${folder ? `${folder}/` : ''}${name}`,
        metadata: {
          contentType: mimetype,
        },
      });

      return file.metadata.name!;
    } catch (error) {
      logger.error(error, `Error uploading file to Google Cloud Storage`);

      throw error;
    } finally {
      if (await stat(filepath).catch(() => false)) {
        await unlink(filepath);
      }
    }
  }

  public async getUrl(name: string): Promise<string> {
    try {
      const file = this.bucket.file(name);
      const [exists] = await file.exists();

      if (!exists) {
        throw new Error(`File ${name} does not exist in bucket`);
      }

      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 1000 * 60 * 60, // 1 hour
      });

      return url;
    } catch (error) {
      logger.error(error, `Error getting URL for file: ${name}`);

      throw error;
    }
  }
}

export const StorageService = GoogleCloudStorage.instance;
