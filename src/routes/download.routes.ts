import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import { createDownload, getDownload } from '../controllers/download.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { downloadBodySchema } from '../validators/download.validator.js';
import { asyncHandler } from '../utils/async-handler.js';

const upload = multer({
  dest: env.UPLOAD_DIR,
  limits: { fileSize: env.MAX_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.mp3') { cb(new Error('Only .mp3 files are accepted.')); return; }
    cb(null, true);
  }
});
export const downloadRouter = Router();
downloadRouter.post('/', upload.single('audio'), validateBody(downloadBodySchema), asyncHandler(createDownload));
downloadRouter.get('/:jobId', asyncHandler(getDownload));
