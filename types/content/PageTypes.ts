import { z } from 'zod'

export const DynamicPageStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])

export const PageSectionSchema = z.object({
  id: z.string(),
  type: z.string(),
  order: z.number(),
  props: z.record(z.unknown()),
})

export const PageMetadataSchema = z.object({
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterCard: z.string().optional(),
}).optional()

export const DefaultPageMetadata: z.infer<typeof PageMetadataSchema> = {
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  twitterTitle: '',
  twitterDescription: '',
  twitterCard: '',
}

export const DynamicPageSchema = z.object({
    dynamicPageId: z.string(),
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    keywords: z.array(z.string()),
    sections: z.array(PageSectionSchema),
    metadata: PageMetadataSchema,
    status: DynamicPageStatusEnum,
    createdAt: z.preprocess((arg) => {
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg)
      }
      return arg
    }, z.date()),
    updatedAt: z.preprocess((arg) => {
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg)
      }
      return arg
    }, z.date()),
})

export type PageSection = z.infer<typeof PageSectionSchema>
export type DynamicPage = z.infer<typeof DynamicPageSchema>
export type PageMetadata = z.infer<typeof PageMetadataSchema>
export type DynamicPageStatus = z.infer<typeof DynamicPageStatusEnum>
