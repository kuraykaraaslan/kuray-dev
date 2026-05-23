import type { BlockData, FieldSchema } from '../types'
import { CURRENT_SCHEMA_VERSION } from '@/types/content/PageTypes'

export { CURRENT_SCHEMA_VERSION }

/**
 * Each entry transforms sections from the previous version to this version.
 *
 * Version history:
 *   v1 – initial schema (id, type, order, props); legacy FieldTypes included
 *        `menu`, `date`, `richtext`; no `repeater` field type
 *   v2 – added optional hidden/label/className to BlockData;
 *        FieldType renames (richtext → rich-text, menu → select, date → text);
 *        introduced `repeater` (props formerly stored as CSV/JSON strings,
 *        primitive arrays, or single objects are reshaped into arrays of objects
 *        when the block schema declares them as repeaters).
 */

export type BlockSchemas = Record<string, Record<string, FieldSchema>>

export interface MigrationContext {
  /** Optional registry of block schemas keyed by block type (code + DB). */
  blockSchemas?: BlockSchemas
}

type MigrationFn = (sections: BlockData[], ctx: MigrationContext) => BlockData[]

const LEGACY_FIELD_TYPE_RENAMES: Record<string, string> = {
  richtext: 'rich-text',
  menu: 'select',
  date: 'text',
}

const renameLegacyFieldTypeTokens = (sections: BlockData[]): BlockData[] =>
  sections.map((s) => {
    const props: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(s.props ?? {})) {
      props[k] = typeof v === 'string' && LEGACY_FIELD_TYPE_RENAMES[v] ? LEGACY_FIELD_TYPE_RENAMES[v] : v
    }
    return { ...s, props }
  })

const SPLIT_PATTERN = /\s*[\n,;|]\s*/

/** Try to parse a string as JSON; returns the parsed value or `undefined` if it fails. */
function tryParseJson(s: string): unknown {
  const trimmed = s.trim()
  if (!trimmed) return undefined
  const looksJson = trimmed.startsWith('[') || trimmed.startsWith('{') || trimmed.startsWith('"')
  if (!looksJson) return undefined
  try {
    return JSON.parse(trimmed)
  } catch {
    return undefined
  }
}

/**
 * Reshape an arbitrary v1 prop value into a v2 repeater array (`Array<Record<string, unknown>>`)
 * using `field.fields` as the target sub-schema. Best-effort heuristic.
 */
function coerceToRepeaterRows(
  value: unknown,
  fieldDef: FieldSchema,
): Array<Record<string, unknown>> {
  const subKeys = Object.keys(fieldDef.fields ?? {})
  const firstKey = subKeys[0] ?? 'value'

  const wrapPrimitive = (v: unknown): Record<string, unknown> => ({ [firstKey]: v })

  if (value === undefined || value === null || value === '') return []

  // String: try JSON first, then split by common separators
  if (typeof value === 'string') {
    const parsed = tryParseJson(value)
    if (parsed !== undefined) return coerceToRepeaterRows(parsed, fieldDef)
    return value
      .split(SPLIT_PATTERN)
      .map((s) => s.trim())
      .filter(Boolean)
      .map(wrapPrimitive)
  }

  // Array
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        return item as Record<string, unknown>
      }
      return wrapPrimitive(item)
    })
  }

  // Single object → wrap in single-element array
  if (typeof value === 'object') {
    return [value as Record<string, unknown>]
  }

  // Primitive (number/boolean) → wrap
  return [wrapPrimitive(value)]
}

/**
 * For each block, look up its schema; for every field declared as `repeater`,
 * reshape the corresponding prop into `Array<Record<string, unknown>>` if it
 * isn't already in that shape. Idempotent — safe to run on already-migrated
 * data. Returns the reshaped sections plus the number of fields actually
 * converted (per <blockType,propKey> hit).
 */
export function normalizeRepeaters(
  sections: BlockData[],
  ctx: MigrationContext,
): { sections: BlockData[]; conversions: number; converted: Array<{ blockType: string; propKey: string }> } {
  const schemas = ctx.blockSchemas
  if (!schemas) return { sections, conversions: 0, converted: [] }

  let conversions = 0
  const converted: Array<{ blockType: string; propKey: string }> = []

  const next = sections.map((s) => {
    const blockSchema = schemas[s.type]
    if (!blockSchema) return s

    const props = { ...(s.props ?? {}) }
    let changed = false
    for (const [propKey, fieldDef] of Object.entries(blockSchema)) {
      if (fieldDef.type !== 'repeater') continue
      const current = props[propKey]
      const alreadyOk =
        Array.isArray(current) &&
        current.every((item) => item !== null && typeof item === 'object' && !Array.isArray(item))
      if (alreadyOk) continue
      props[propKey] = coerceToRepeaterRows(current, fieldDef)
      changed = true
      conversions++
      converted.push({ blockType: s.type, propKey })
    }
    return changed ? { ...s, props } : s
  })

  return { sections: next, conversions, converted }
}

const migrations: Partial<Record<number, MigrationFn>> = {
  2: (sections, ctx) => normalizeRepeaters(renameLegacyFieldTypeTokens(sections), ctx).sections,
}

/**
 * Best-effort detection of the input's schemaVersion. Looks at top-level
 * `schemaVersion`, falls back to v1 if absent (since v1 didn't carry the field).
 */
export function detectSchemaVersion(input: unknown): number {
  if (input && typeof input === 'object') {
    const v = (input as Record<string, unknown>).schemaVersion
    if (typeof v === 'number' && Number.isFinite(v) && v >= 1) return Math.floor(v)
  }
  return 1
}

/**
 * Runs all pending migrations from `fromVersion` up to CURRENT_SCHEMA_VERSION.
 * Returns the (possibly transformed) sections, the new version number, and
 * the list of migration steps actually applied (useful for logging/import UI).
 */
export function migrateSections(
  sections: BlockData[],
  fromVersion: number,
  ctx: MigrationContext = {},
): { sections: BlockData[]; schemaVersion: number; appliedMigrations: number[] } {
  if (fromVersion >= CURRENT_SCHEMA_VERSION) {
    return { sections, schemaVersion: fromVersion, appliedMigrations: [] }
  }

  const applied: number[] = []
  let current = sections
  for (let v = fromVersion + 1; v <= CURRENT_SCHEMA_VERSION; v++) {
    const fn = migrations[v]
    if (fn) {
      current = fn(current, ctx)
      applied.push(v)
    }
  }

  return { sections: current, schemaVersion: CURRENT_SCHEMA_VERSION, appliedMigrations: applied }
}

export function needsMigration(schemaVersion: number): boolean {
  return schemaVersion < CURRENT_SCHEMA_VERSION
}
