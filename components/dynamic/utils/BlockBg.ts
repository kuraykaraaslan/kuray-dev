import type { FieldSchema } from '../types'

export type BgType = 'none' | 'svg' | 'image' | 'video' | 'color'

export interface BgProps {
  bgType: BgType
  bgImage: string
  bgVideo: string
  bgColor: string
  bgOpacity: number
}

export function parseBgProps(raw: Record<string, unknown>): BgProps {
  return {
    bgType:    ((raw.bgType as string)    || 'none') as BgType,
    bgImage:   (raw.bgImage  as string)  || '',
    bgVideo:   (raw.bgVideo  as string)  || '',
    bgColor:   (raw.bgColor  as string)  || '',
    bgOpacity: Number(raw.bgOpacity)     || 20,
  }
}

export const BG_DEFAULT_PROPS: Record<string, unknown> = {
  bgType:    'none',
  bgImage:   '',
  bgVideo:   '',
  bgColor:   '',
  bgOpacity: 20,
}

export const BG_SCHEMA_FIELDS: Record<string, FieldSchema> = {
  bgType: {
    label: 'Background Type',
    type: 'select',
    options: ['none', 'svg', 'image', 'video', 'color'],
    value: 'none',
  },
  bgImage: {
    label: 'Background Image',
    type: 'img',
    uploadFolder: 'backgrounds',
    value: '',
  },
  bgVideo: {
    label: 'Background Video (.mp4 URL)',
    type: 'url',
    value: '',
  },
  bgColor: {
    label: 'Background Color',
    type: 'color',
    value: '',
  },
  bgOpacity: {
    label: 'Background Opacity (0–100)',
    type: 'number',
    value: 20,
  },
}
