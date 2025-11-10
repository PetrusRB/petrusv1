import { z } from 'zod';

export const EpisodesSchema = z.object({
  eps: z.number().nullable(),
  sub: z.number().nullable(),
  dub: z.number().nullable(),
});

export const AnimeItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  img: z.string(),
  episodes: EpisodesSchema,
  duration: z.string(),
  rated: z.boolean(),
});

export const AnimeResponseSchema = z.object({
  results: z.array(AnimeItemSchema),
  currentPage: z.number().optional(),
  hasNextPage: z.boolean().optional(),
});
