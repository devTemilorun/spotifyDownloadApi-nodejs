import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  API_PREFIX: z.string().default('/api/v1'),
  PUBLIC_BASE_URL: z.string().url().default('http://localhost:5000'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  UPLOAD_DIR: z.string().default('./storage/uploads'),
  DOWNLOAD_DIR: z.string().default('./storage/downloads'),
  TEMP_DIR: z.string().default('./temp'),
  MAX_FILE_SIZE: z.coerce.number().int().positive().default(50 * 1024 * 1024),
  MAX_DOWNLOAD_ATTEMPTS: z.coerce.number().int().positive().default(3),
  AWS_REGION: z.string().optional().default(''),
  AWS_ACCESS_KEY_ID: z.string().optional().default(''),
  AWS_SECRET_ACCESS_KEY: z.string().optional().default(''),
  AWS_BUCKET_NAME: z.string().optional().default(''),
  SPOTIFY_CLIENT_ID: z.string().optional().default(''),
  SPOTIFY_CLIENT_SECRET: z.string().optional().default(''),
  LOG_LEVEL: z.enum(['fatal','error','warn','info','debug','trace','silent']).default('info')
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const env = parsed.data;
