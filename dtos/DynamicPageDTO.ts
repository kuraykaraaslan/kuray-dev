import { z } from 'zod'

const BlockDataSchema = z.object({
  id: z.string(),
  type: z.string(),
  order: z.number(),
  props: z.record(z.unknown()),
})

const MetadataSchema = z.object({
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterCard: z.string().optional(),
}).optional()

export const CreateDynamicPageSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  title: z.string().min(1),
  description: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  sections: z.array(BlockDataSchema).default([]),
  metadata: MetadataSchema,
  isPublished: z.boolean().default(false),
})

export const UpdateDynamicPageSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  sections: z.array(BlockDataSchema).optional(),
  metadata: MetadataSchema,
  isPublished: z.boolean().optional(),
})

export const DynamicPageParamsSchema = z.object({
  dynamicSlugA: z.string(),
  dynamicSlugB: z.string().optional(),
  dynamicSlugC: z.string().optional(),
  dynamicSlugD: z.string().optional(),
  dynamicSlugE: z.string().optional(),
  dynamicSlugF: z.string().optional()
})

export type BlockData = z.infer<typeof BlockDataSchema>
export type CreateDynamicPageRequest = z.infer<typeof CreateDynamicPageSchema>
export type UpdateDynamicPageRequest = z.infer<typeof UpdateDynamicPageSchema>
export type PageMetadata = z.infer<typeof MetadataSchema>
export type DynamicPageParams = z.infer<typeof DynamicPageParamsSchema>
