import { z } from 'zod'
import { BlockDataSchema, PageMetadataSchema, DynamicPageStatusEnum } from '../types/content/PageTypes'

const slugSchema = z.union([
  z.literal(''),
  z.string().min(1).regex(/^[a-z0-9/-]+$/, 'Slug must be lowercase letters, numbers, hyphens, or slashes'),
])

export const CreateDynamicPageSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  description: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  sections: z.array(BlockDataSchema).default([]),
  metadata: PageMetadataSchema,
  status: DynamicPageStatusEnum.default('DRAFT'),
})

export const UpdateDynamicPageSchema = z.object({
  slug: slugSchema.optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  sections: z.array(BlockDataSchema).optional(),
  metadata: PageMetadataSchema,
  status: DynamicPageStatusEnum.optional(),
})

export const DynamicPageParamsSchema = z.object({
  lang: z.string().optional(),
  dynamicSlugA: z.string(),
  dynamicSlugB: z.string().optional(),
  dynamicSlugC: z.string().optional(),
  dynamicSlugD: z.string().optional(),
  dynamicSlugE: z.string().optional(),
  dynamicSlugF: z.string().optional(),
})

export type { BlockData } from '../types/content/PageTypes'
export type CreateDynamicPageRequest = z.infer<typeof CreateDynamicPageSchema>
export type UpdateDynamicPageRequest = z.infer<typeof UpdateDynamicPageSchema>
export type DynamicPageParams = z.infer<typeof DynamicPageParamsSchema>
