import type { CSSProperties } from 'react'

/**
 * Returns className + style for a block's background.
 * When a custom color is provided it uses an inline style.
 * When empty/null it falls back to a Tailwind/DaisyUI class so the
 * block follows the active theme automatically.
 */
export function blockBg(
  color: string | undefined | null,
  defaultClass = 'bg-base-200',
): { className: string; style?: CSSProperties } {
  if (color) return { className: '', style: { backgroundColor: color } }
  return { className: defaultClass }
}
