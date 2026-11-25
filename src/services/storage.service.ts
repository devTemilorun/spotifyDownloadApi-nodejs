import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFile } from 'node:fs/promises';
import { env } from '../config/env.js';

const s3 = env.STORAGE_DRIVER === 's3' ? new S3Client({ region: env.AWS_REGION }) : null;
export async function storeCompletedFile(sourcePath: string): Promise<{ filename: string; downloadUrl: string }> {
  const filename = `${randomUUID()}.mp3`;
  if (env.STORAGE_DRIVER === 's3') {
    if (!s3 || !env.AWS_BUCKET_NAME) throw new Error('S3 storage is selected but AWS_BUCKET_NAME is missing.');
    await s3.send(new PutObjectCommand({ Bucket: env.AWS_BUCKET_NAME, Key: filename,
      Body: await readFile(sourcePath), ContentType: 'audio/mpeg' }));
    return { filename, downloadUrl: `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${filename}` };
  }
  await mkdir(env.DOWNLOAD_DIR, { recursive: true });
  await copyFile(sourcePath, path.join(env.DOWNLOAD_DIR, filename));
  return { filename, downloadUrl: `${env.PUBLIC_BASE_URL}/api/v1/files/${filename}` };
}
