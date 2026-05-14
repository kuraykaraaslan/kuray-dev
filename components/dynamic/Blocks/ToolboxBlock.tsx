'use client'
import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../BaseBlock'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ICON_MAP } from '../icons'
import type { BlockDefinition } from '../types'

interface ToolItem {
  icon: string
  text: string
}

interface RowItem {
  type: 'big' | 'small'
  label: string
  labelSide: 'left' | 'right'
  tools: ToolItem[]
}

function BigTool({ icon, text, flipped }: ToolItem & { flipped: boolean }) {
  const iconDef = ICON_MAP[icon]
  return (
    <div className="w-36 h-36 select-none">
      <div className={`relative card rounded-none w-36 h-36 from-base-100 to-base-300 bg-gradient-to-b shadow-lg transition duration-500 transform ${flipped ? 'rotate-y-180' : ''}`}>
        <div className={`flex flex-col items-center justify-center h-full ${flipped ? 'hidden' : ''}`}>
          {iconDef && <FontAwesomeIcon icon={iconDef} className="text-6xl" />}
        </div>
        <div className={`flex-col items-center justify-center rotate-y-180 w-36 h-36 top-0 left-0 absolute bg-primary text-primary-content rounded-none ${flipped ? 'flex' : 'hidden'}`}>
          {iconDef && <FontAwesomeIcon icon={iconDef} className="text-3xl mb-2" />}
          <span className="text-sm font-semibold text-center px-2 leading-tight">{text}</span>
        </div>
      </div>
    </div>
  )
}

function SmallTool({ icon, text, flipped }: ToolItem & { flipped: boolean }) {
  const iconDef = ICON_MAP[icon]
  return (
    <div className="w-28 h-20 select-none">
      <div className={`relative card rounded-none w-28 h-20 from-base-100 to-base-300 bg-gradient-to-b shadow-lg transition duration-500 transform ${flipped ? 'rotate-y-180' : ''}`}>
        <div className={`flex flex-col items-center justify-center h-full gap-1 ${flipped ? 'hidden' : ''}`}>
          {iconDef && <FontAwesomeIcon icon={iconDef} className="text-2xl" />}
          <span className="text-xs text-center px-1 leading-tight opacity-60">{text}</span>
        </div>
        <div className={`flex-col items-center justify-center rotate-y-180 w-28 h-20 top-0 left-0 absolute bg-primary text-primary-content rounded-none ${flipped ? 'flex' : 'hidden'}`}>
          <span className="text-xs font-semibold text-center px-2 leading-tight">{text}</span>
        </div>
      </div>
    </div>
  )
}

function ToolboxBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const title = (rawProps.title as string) || 'Toolbox'
  const description = (rawProps.description as string) || 'Technologies and skills I use every day.'
  const rows = (rawProps.rows as RowItem[]) || []
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 w-full">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="col-span-2 md:col-span-1 md:col-start-3 overflow-hidden">
            <h2 className="text-4xl lg:text-3xl font-bold mt-6 text-center md:text-end">{title}</h2>
          </div>
          <div className="col-span-1 md:col-start-4 hidden md:block">
            <p className="mt-6 pe-4">{description}</p>
          </div>
        </div>

        <div className="space-y-10 py-4">
          {rows.map((row, rowIdx) => {
            const tools = row.tools ?? []
            const isRight = row.labelSide === 'right'
            const flipped = hoveredRow === rowIdx
            const labelEl = row.label ? (
              <div className="md:w-28 flex-shrink-0 text-center md:text-right">
                <span className="text-xl font-bold">{row.label}</span>
              </div>
            ) : null
            const toolsEl = (
              <div
                className="flex flex-wrap gap-4 justify-center"
                onMouseEnter={() => setHoveredRow(rowIdx)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {tools.map((tool, toolIdx) =>
                  row.type === 'big'
                    ? <BigTool key={toolIdx} {...tool} flipped={flipped} />
                    : <SmallTool key={toolIdx} {...tool} flipped={flipped} />
                )}
                {tools.length === 0 && (
                  <span className="text-xs text-base-content/30 italic">No tools added</span>
                )}
              </div>
            )
            return (
              <div key={rowIdx} className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                {isRight ? <>{toolsEl}{labelEl}</> : <>{labelEl}{toolsEl}</>}
              </div>
            )
          })}
          {rows.length === 0 && (
            <p className="text-center text-base-content/30 text-sm">Add rows to display your toolbox.</p>
          )}
        </div>
      </div>
    </BaseBlock>
  )
}

export const ToolboxBlockDefinition: BlockDefinition = {
  type: 'ToolboxBlock',
  label: 'Toolbox',
  description: 'Skills and technology grid with configurable big/small rows of tools.',
  category: 'Hero',
  defaultProps: {
    title: 'Toolbox',
    blockClass: 'hero bg-base-300 py-8 px-4 md:px-20 items-center justify-center min-h-screen',
    description: 'Technologies and skills I use every day.',
    ...BASE_BLOCK_DEFAULT_PROPS,
    rows: [
      {
        type: 'big',
        label: 'Frontend',
        labelSide: 'right',
        tools: [
          { icon: 'react', text: 'React' },
          { icon: 'css3', text: 'CSS' },
          { icon: 'html5', text: 'HTML' },
          { icon: 'figma', text: 'Figma' },
        ],
      },
      {
        type: 'big',
        label: 'Backend',
        labelSide: 'left',
        tools: [
          { icon: 'nodejs', text: 'Node.js' },
          { icon: 'java', text: 'Java' },
          { icon: 'php', text: 'PHP' },
          { icon: 'linux', text: 'Linux' },
        ],
      },
      {
        type: 'small',
        label: 'Skills',
        labelSide: 'left',
        tools: [
          { icon: 'code', text: 'Clean Code' },
          { icon: 'key', text: 'Auth & Security' },
          { icon: 'database', text: 'SQL & Data' },
          { icon: 'cloud', text: 'Cloud & Infra' },
          { icon: 'vial', text: 'Testing & CI/CD' },
          { icon: 'rocket', text: 'Performance' },
        ],
      },
    ],
  },
  schema: {
    title: { label: 'Section Title', type: 'text' },
    description: { label: 'Section Description', type: 'textarea' },
    rows: {
      label: 'Rows',
      type: 'repeater',
      fields: {
        type: { label: 'Row Type', type: 'select', options: ['big', 'small'], value: 'big' },
        label: { label: 'Row Label', type: 'text', value: '' },
        labelSide: { label: 'Label Side', type: 'select', options: ['left', 'right'], value: 'left' },
        tools: {
          label: 'Tools',
          type: 'repeater',
          fields: {
            icon: { label: 'Icon', type: 'icon', value: '' },
            text: { label: 'Label', type: 'text', value: '' },
          },
        },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: ToolboxBlock as unknown as BlockDefinition['Component'],
}

export default ToolboxBlock
