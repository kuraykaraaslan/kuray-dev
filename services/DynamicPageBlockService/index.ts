import { cache } from 'react'
import { prisma } from '@/libs/prisma'
import type { DynamicPageBlockRecord, FieldSchema } from '@/components/dynamic/types'

function toRecord(raw: {
  blockId: string
  type: string
  label: string
  category: string
  description: string | null
  schema: unknown
  defaultProps: unknown
  template: string
  isSystem: boolean
}): DynamicPageBlockRecord {
  return {
    blockId: raw.blockId,
    type: raw.type,
    label: raw.label,
    category: raw.category,
    description: raw.description ?? '',
    schema: (raw.schema as Record<string, FieldSchema>) ?? {},
    defaultProps: (raw.defaultProps as Record<string, unknown>) ?? {},
    template: raw.template,
    isSystem: raw.isSystem,
  }
}

const fetchAllBlocks = cache(async (): Promise<DynamicPageBlockRecord[]> => {
  const rows = await prisma.dynamicPageBlock.findMany({ orderBy: [{ category: 'asc' }, { label: 'asc' }] })
  return rows.map(toRecord)
})

export default class DynamicPageBlockService {
  static async getAll(): Promise<DynamicPageBlockRecord[]> {
    return fetchAllBlocks()
  }

  static async getByType(type: string): Promise<DynamicPageBlockRecord | null> {
    const row = await prisma.dynamicPageBlock.findUnique({ where: { type } })
    return row ? toRecord(row) : null
  }

  static async create(data: Omit<DynamicPageBlockRecord, 'blockId'>): Promise<DynamicPageBlockRecord> {
    const row = await prisma.dynamicPageBlock.create({
      data: {
        type: data.type,
        label: data.label,
        category: data.category,
        description: data.description || null,
        schema: data.schema as object,
        defaultProps: data.defaultProps as object,
        template: data.template,
        isSystem: data.isSystem,
      },
    })
    return toRecord(row)
  }

  static async update(blockId: string, data: Partial<Omit<DynamicPageBlockRecord, 'blockId'>>): Promise<DynamicPageBlockRecord> {
    const row = await prisma.dynamicPageBlock.update({
      where: { blockId },
      data: {
        ...(data.type !== undefined && { type: data.type }),
        ...(data.label !== undefined && { label: data.label }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.schema !== undefined && { schema: data.schema as object }),
        ...(data.defaultProps !== undefined && { defaultProps: data.defaultProps as object }),
        ...(data.template !== undefined && { template: data.template }),
      },
    })
    return toRecord(row)
  }

  static async delete(blockId: string): Promise<void> {
    const row = await prisma.dynamicPageBlock.findUnique({ where: { blockId } })
    if (row?.isSystem) throw new Error('System blocks cannot be deleted')
    await prisma.dynamicPageBlock.delete({ where: { blockId } })
  }
}
