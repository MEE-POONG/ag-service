import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  content: string | React.ReactNode
  children: React.ReactElement
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  className?: string
  disabled?: boolean
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  delay = 300,
  className = '',
  disabled = false
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const showTooltip = () => {
    if (disabled) return
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
      updatePosition()
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let x = 0
    let y = 0

    switch (placement) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
        y = triggerRect.top - tooltipRect.height - 8
        break
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
        y = triggerRect.bottom + 8
        break
      case 'left':
        x = triggerRect.left - tooltipRect.width - 8
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
        break
      case 'right':
        x = triggerRect.right + 8
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
        break
    }

    // Keep tooltip within viewport
    x = Math.max(8, Math.min(x, viewportWidth - tooltipRect.width - 8))
    y = Math.max(8, Math.min(y, viewportHeight - tooltipRect.height - 8))

    setPosition({ x, y })
  }, [placement])

  useEffect(() => {
    if (isVisible) {
      updatePosition()
    }
  }, [isVisible, updatePosition])

  useEffect(() => {
    const handleScroll = () => {
      if (isVisible) {
        updatePosition()
      }
    }

    const handleResize = () => {
      if (isVisible) {
        updatePosition()
      }
    }

    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isVisible, updatePosition])

  const clonedChildren = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    onFocus: showTooltip,
    onBlur: hideTooltip,
  })

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-2 h-2 bg-gray-900 transform rotate-45'
    
    switch (placement) {
      case 'top':
        return `${baseClasses} -bottom-1 left-1/2 -translate-x-1/2`
      case 'bottom':
        return `${baseClasses} -top-1 left-1/2 -translate-x-1/2`
      case 'left':
        return `${baseClasses} -right-1 top-1/2 -translate-y-1/2`
      case 'right':
        return `${baseClasses} -left-1 top-1/2 -translate-y-1/2`
      default:
        return baseClasses
    }
  }

  const tooltip = isVisible && typeof window !== 'undefined' ? createPortal(
    <div
      ref={tooltipRef}
      className={`
        fixed z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg
        pointer-events-none max-w-xs break-words
        ${className}
      `}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className={getArrowClasses()} />
      {content}
    </div>,
    document.body
  ) : null

  return (
    <>
      {clonedChildren}
      {tooltip}
    </>
  )
}

export default Tooltip
