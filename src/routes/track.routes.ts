import { Router } from 'express';
import { getTrack } from '../controllers/track.controller.js';
import { asyncHandler } from '../utils/async-handler.js';
export const trackRouter = Router();
trackRouter.get('/spotify', asyncHandler(getTrack));
