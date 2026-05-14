import type { BlockData } from '../types'
import { CURRENT_SCHEMA_VERSION } from '@/types/content/PageTypes'

export { CURRENT_SCHEMA_VERSION }

/**
 * Each entry transforms sections from the previous version to this version.
 *
 * Version history:
 *   v1 – initial schema (id, type, order, props, hidden?, label?)
 *   v2 – added className? to BlockData; no structural changes needed
 */
type MigrationFn = (sections: BlockData[]) => BlockData[]

const migrations: Partial<Record<number, MigrationFn>> = {
  2: (sections) => sections, // v1 → v2: className is optional; no transform required
}

/**
 * Runs all pending migrations from `fromVersion` up to CURRENT_SCHEMA_VERSION.
 * Returns the (possibly transformed) sections and the new version number.
 */
export function migrateSections(
  sections: BlockData[],
  fromVersion: number
): { sections: BlockData[]; schemaVersion: number } {
  if (fromVersion >= CURRENT_SCHEMA_VERSION) {
    return { sections, schemaVersion: fromVersion }
  }

  let current = sections
  for (let v = fromVersion + 1; v <= CURRENT_SCHEMA_VERSION; v++) {
    const fn = migrations[v]
    if (fn) current = fn(current)
  }

  return { sections: current, schemaVersion: CURRENT_SCHEMA_VERSION }
}

export function needsMigration(schemaVersion: number): boolean {
  return schemaVersion < CURRENT_SCHEMA_VERSION
}
