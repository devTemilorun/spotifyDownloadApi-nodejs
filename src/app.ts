
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as pinoHttpModule from 'pino-http';
import path from 'node:path';

import { logger } from './utils/logger.js';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { apiRateLimit } from './middleware/rate-limit.middleware.js';
import { notFoundMiddleware } from './middleware/not-found.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const pinoHttp =
  (pinoHttpModule as unknown as {
    default: typeof import('pino-http').default;
  }).default;

export const app = express();

app.disable('x-powered-by');

app.use(helmet());

app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((item) => item.trim()),
    credentials: true,
  }),
);

app.use(express.json({ limit: '1mb' }));

app.use(pinoHttp({ logger }));

app.use(apiRateLimit);

app.use(
  `${env.API_PREFIX}/files`,
  express.static(path.resolve(env.DOWNLOAD_DIR), {
    fallthrough: false,
  }),
);

app.use(env.API_PREFIX, apiRouter);

app.use(notFoundMiddleware);

app.use(errorMiddleware);
