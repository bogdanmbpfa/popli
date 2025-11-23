import { Bucket, Storage } from '@google-cloud/storage';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { stat, unlink, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

@Injectable()
export class StorageUtility {
  private bucket: Bucket;
  private storage: Storage;
  private readonly logger = new Logger(StorageUtility.name);

  constructor(private readonly configService: ConfigService) {
    this.storage = new Storage({
      projectId: this.configService.get('googleCloud.projectId'),
      universeDomain: 'googleapis.com',
      credentials: {
        type: 'service_account',
        project_id: this.configService.get('googleCloud.projectId') as string,
        client_email: this.configService.get(
          'googleCloud.storage.serviceAccountEmail',
        ),
        private_key: this.configService
          .get('googleCloud.storage.serviceAccountKey')
          .replace(/\\n/g, '\n'),
      },
    });

    this.bucket = this.storage.bucket(
      this.configService.get('googleCloud.storage.bucket') as string,
    );
  }

  async upload(
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

      this.logger.log(`Uploading file to Google Cloud Storage: ${filepath}`);

      const [file] = await this.bucket.upload(filepath, {
        destination: `${folder ? `${folder}/` : ''}${name}`,
        metadata: {
          contentType: mimetype,
        },
      });

      return file.metadata.name!;
    } catch (error) {
      this.logger.error(error, `Error uploading file to Google Cloud Storage`);

      throw error;
    } finally {
      if (await stat(filepath).catch(() => false)) {
        await unlink(filepath);
      }
    }
  }

  async getUrl(name: string): Promise<string> {
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
      this.logger.error(error, `Error getting URL for file: ${name}`);

      throw error;
    }
  }
}
