import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string
  className?: string
  variant?:
  | ""
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "light"
  | "info"
  | "light"
  | "dark"
  | "destructive"
  | "ghost"
  size?: "" | "sm" | "lg" | "icon" | "xs"
}

const getVariantClass = (variant?: ButtonProps["variant"]) => {
  const basePrimary =
    "px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
  const baseSecondary =
    "px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
  const baseSuccess =
    "px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
  const baseWarning =
    "px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
  const baseDanger =
    "px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
  const baseInfo =
    "px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
  const baseLight =
    "px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
  const baseDark =
    "px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
  const baseDestructive =
    "px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
  const baseGhost =
    "px-4 py-2 bg-transparent text-gray-700 rounded-lg hover:bg-gray-100"

  switch (variant) {
    case "primary":
      return basePrimary
    case "secondary":
      return baseSecondary
    case "success":
      return baseSuccess
    case "warning":
      return baseWarning
    case "danger":
      return baseDanger
    case "info":
      return baseInfo
    case "light":
      return baseLight
    case "dark":
      return baseDark
    case "destructive":
      return baseDestructive
    case "ghost":
      return baseGhost
    case "":
    default:
      return ""
  }
}

const getSizeClass = (size?: ButtonProps["size"]) => {
  switch (size) {
    case "xs":
      return "h-7 px-2 text-xs"
    case "sm":
      return "h-9 px-3 text-sm"
    case "lg":
      return "h-11 px-8 text-lg"
    case "icon":
      return "h-10 w-10 p-0"
    case "":
    default:
      return ""
  }
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "", size = "", title, ...props }, ref) => {
    const variantClass = getVariantClass(variant)
    const sizeClass = getSizeClass(size)

    return (
      <button
        title={title}
        ref={ref}
        className={`inline-flex items-center transition-colors disabled:opacity-50 disabled:pointer-events-none ${variantClass} ${sizeClass} ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
