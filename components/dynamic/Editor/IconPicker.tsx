'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ICON_OPTIONS } from '../icons'

interface IconPickerProps {
  value: string
  onChange: (name: string) => void
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const current = ICON_OPTIONS.find((o) => o.name === value)

  return (
    <div className="space-y-1.5">
      {current && (
        <div className="flex items-center gap-2 px-2 py-1.5 bg-base-300 rounded text-xs text-base-content/70">
          <FontAwesomeIcon icon={current.icon} className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{value}</span>
        </div>
      )}
      <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto pr-0.5">
        {ICON_OPTIONS.map(({ name, icon }) => (
          <button
            key={name}
            type="button"
            title={name}
            onClick={() => onChange(name)}
            className={[
              'flex flex-col items-center justify-center p-1.5 rounded gap-0.5 transition-colors',
              value === name
                ? 'bg-primary text-primary-content'
                : 'hover:bg-base-300 text-base-content/60 hover:text-base-content',
            ].join(' ')}
          >
            <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5" />
            <span className="text-[8px] leading-none truncate w-full text-center">{name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
