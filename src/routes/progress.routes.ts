import { Router } from 'express';
import { streamProgress } from '../controllers/progress.controller.js';
import { asyncHandler } from '../utils/async-handler.js';
export const progressRouter = Router();
progressRouter.get('/:jobId', asyncHandler(streamProgress));
