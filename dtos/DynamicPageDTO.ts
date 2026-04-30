import { z } from 'zod'
import { BlockDataSchema, PageMetadataSchema, DynamicPageStatusEnum } from '../types/content/PageTypes'

export const CreateDynamicPageSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  title: z.string().min(1),
  description: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  sections: z.array(BlockDataSchema).default([]),
  metadata: PageMetadataSchema,
  status: DynamicPageStatusEnum.default('DRAFT'),
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
  metadata: PageMetadataSchema,
  status: DynamicPageStatusEnum.optional(),
})

export const DynamicPageParamsSchema = z.object({
  dynamicSlugA: z.string(),
  dynamicSlugB: z.string().optional(),
  dynamicSlugC: z.string().optional(),
  dynamicSlugD: z.string().optional(),
  dynamicSlugE: z.string().optional(),
  dynamicSlugF: z.string().optional()
})

export type { BlockData } from '../types/content/PageTypes'
export type CreateDynamicPageRequest = z.infer<typeof CreateDynamicPageSchema>
export type UpdateDynamicPageRequest = z.infer<typeof UpdateDynamicPageSchema>
export type DynamicPageParams = z.infer<typeof DynamicPageParamsSchema>
