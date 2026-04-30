import GenericElement, { GenericElementProps } from '../GenericElement'

export interface DynamicTextProps extends GenericElementProps {
  value: string
  placeholder?: string
  setValue: (value: string) => void
  size?: 'sm' | 'md' | 'lg'
  isTextarea?: boolean
  prefix?: string
  postfix?: string
}

const DynamicText: React.FC<DynamicTextProps> = ({
  label,
  placeholder,
  className = '',
  value,
  setValue,
  size = 'md',
  isTextarea = false,
  prefix,
  postfix,
}) => {
  const sizeClass = size === 'sm' ? 'input-sm' : size === 'lg' ? 'input-lg' : 'input-md'

  return (
    <GenericElement label={label} className={className}>
      {isTextarea ? (
        <textarea
          className={`textarea ${sizeClass} w-full`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : prefix || postfix ? (
        <div className={`input ${sizeClass} w-full flex items-center gap-2`}>
          {prefix && <span className="text-base-content/50">{prefix}</span>}
          <input
            type="text"
            className="grow outline-none bg-transparent"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          {postfix && <span className="text-base-content/50">{postfix}</span>}
        </div>
      ) : (
        <input
          type="text"
          className={`input ${sizeClass} w-full`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      )}
    </GenericElement>
  )
}

export default DynamicText
