import { z } from 'zod'
import { PageMetadataSchema } from '../types/content/PageTypes'

const PageSectionSchema = z.object({
  id: z.string(),
  type: z.string(),
  order: z.number(),
  props: z.record(z.unknown()),
})

export const CreateDynamicPageSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  title: z.string().min(1),
  description: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  sections: z.array(PageSectionSchema).default([]),
  metadata: PageMetadataSchema,
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
  sections: z.array(PageSectionSchema).optional(),
  metadata: PageMetadataSchema,
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

export type PageSection = z.infer<typeof PageSectionSchema>
export type CreateDynamicPageRequest = z.infer<typeof CreateDynamicPageSchema>
export type UpdateDynamicPageRequest = z.infer<typeof UpdateDynamicPageSchema>
export type DynamicPageParams = z.infer<typeof DynamicPageParamsSchema>
