import { z } from 'zod';
import { spotifyUrlSchema } from './spotify.validator.js';
export const downloadBodySchema = z.object({ spotifyUrl: spotifyUrlSchema });
