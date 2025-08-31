import React from 'react'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger'
  label?: string
  className?: string
  children?: React.ReactNode
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  variant = 'default',
  label,
  className = '',
  children
}) => {
  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-11 h-6',
    lg: 'w-14 h-7'
  }

  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const translateClasses = {
    sm: checked ? 'translate-x-4' : 'translate-x-0.5',
    md: checked ? 'translate-x-5' : 'translate-x-0.5',
    lg: checked ? 'translate-x-7' : 'translate-x-0.5'
  }

  const variantClasses = {
    default: checked ? 'bg-blue-600' : 'bg-gray-200',
    success: checked ? 'bg-green-600' : 'bg-gray-200',
    warning: checked ? 'bg-yellow-500' : 'bg-gray-200',
    danger: checked ? 'bg-red-600' : 'bg-gray-200'
  }

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked)
    }
  }

  const toggleElement = (
    <button
      type="button"
      className={`
        relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
      onClick={handleClick}
      disabled={disabled}
      aria-checked={checked}
      role="switch"
      aria-label={label}
    >
      <span
        className={`
          inline-block bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out
          ${thumbSizeClasses[size]}
          ${translateClasses[size]}
        `}
      />
    </button>
  )

  if (children || label) {
    return (
      <label className="flex items-center gap-2 cursor-pointer select-none">
        {toggleElement}
        {children || <span className="text-sm text-gray-700">{label}</span>}
      </label>
    )
  }

  return toggleElement
}

export default Toggle
