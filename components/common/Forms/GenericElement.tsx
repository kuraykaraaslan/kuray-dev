import React from 'react'
import { ActionButton } from './DynamicTable/core/types'

export interface GenericElementProps {
  label?: string
  className?: string
  children?: React.ReactNode
  actions?: ActionButton<any>[]
}

const GenericElement: React.FC<GenericElementProps> = ({ label, className = '', children, actions }) => (
  <div className={`form-control flex flex-col ${className}`}>
    {label && (
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
    )}
    {children}
    {actions && (
      <div className="flex gap-2 mt-2">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`btn ${action.className || 'btn-primary'}`}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        ))}
      </div>
    )}
  </div>
)

export default GenericElement
