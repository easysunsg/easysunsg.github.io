import { defineCollection, z } from 'astro:content';

const wiki = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
        date: z.date().optional(),
        cover: z.string().optional(),
    }),
});

export const collections = { wiki };