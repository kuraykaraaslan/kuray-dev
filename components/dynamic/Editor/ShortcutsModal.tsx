'use client'

import { useEditorStore } from './stores/editorStore'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

const SHORTCUTS: { keys: string; description: string }[] = [
  { keys: 'Ctrl + S', description: 'Save page' },
  { keys: 'Ctrl + Z', description: 'Undo' },
  { keys: 'Ctrl + Y  /  Ctrl + Shift + Z', description: 'Redo' },
  { keys: 'Ctrl + D', description: 'Duplicate selected block' },
  { keys: 'Ctrl + C', description: 'Copy selected block' },
  { keys: 'Ctrl + V', description: 'Paste block after selection' },
  { keys: 'Delete  /  Backspace', description: 'Delete selected block' },
  { keys: 'Escape', description: 'Deselect block' },
  { keys: 'Alt + ↑', description: 'Move block up' },
  { keys: 'Alt + ↓', description: 'Move block down' },
  { keys: 'Ctrl + /', description: 'Toggle this shortcuts panel' },
]

export default function ShortcutsModal() {
  const showShortcuts = useEditorStore((s) => s.showShortcuts)
  const setShowShortcuts = useEditorStore((s) => s.setShowShortcuts)

  if (!showShortcuts) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => setShowShortcuts(false)}
    >
      <div
        className="bg-base-200 rounded-xl shadow-2xl border border-base-content/10 w-96 max-w-[calc(100vw-2rem)] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-content/10">
          <h2 className="text-sm font-semibold text-base-content">Keyboard Shortcuts</h2>
          <button
            onClick={() => setShowShortcuts(false)}
            className="w-6 h-6 flex items-center justify-center rounded text-base-content/40 hover:text-base-content hover:bg-base-300 transition-colors text-xs"
          >
            <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-3 space-y-0.5">
          {SHORTCUTS.map(({ keys, description }) => (
            <div
              key={keys}
              className="flex items-center justify-between gap-4 py-1.5 px-2 rounded hover:bg-base-300 transition-colors"
            >
              <span className="text-xs text-base-content/60">{description}</span>
              <kbd className="flex-shrink-0 px-2 py-0.5 text-[10px] font-mono font-semibold bg-base-300 border border-base-content/15 rounded text-base-content/70 whitespace-nowrap">
                {keys}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-base-content/10 text-[10px] text-base-content/30 text-center">
          Shortcuts are disabled when cursor is inside an input or textarea
        </div>
      </div>
    </div>
  )
}
