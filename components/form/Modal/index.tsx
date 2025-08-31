// components/ui/modal.tsx
import { Button, ButtonProps } from "@/components/ui/button"
import * as React from "react"
import { createPortal } from "react-dom"

type DivProps = React.HTMLAttributes<HTMLDivElement>

export interface ModalProps {
  /** เปิด/ปิด Modal (controlled) */
  open: boolean
  /** เรียกเมื่อมีการเปลี่ยนแปลงสถานะเปิด/ปิด (เช่น กดปุ่มปิด/กด ESC/คลิกพื้นหลัง) */
  onOpenChange: (next: boolean) => void
  /** ปิดเมื่อคลิกพื้นหลัง */
  closeOnOverlayClick?: boolean
  /** ปิดเมื่อกด ESC */
  closeOnEsc?: boolean
  /** ใส่ id สำหรับ aria-controls (ถ้าอยากผูกกับปุ่ม trigger) */
  id?: string
  /** โหนดเป้าหมายของ Portal (เริ่มต้น document.body) */
  container?: Element | null
  /** คลาส tailwind เสริมระดับ wrapper ด้านนอกสุด */
  className?: string
  /** โฟกัสเริ่มต้น (Ref ของ element ที่อยากให้โฟกัสตอนเปิด) */
  initialFocusRef?: React.RefObject<HTMLElement>
  /** ปรับขนาด dialog (กำหนดความกว้าง) */
  size?: "sm" | "md" | "lg" | "xl" | "full"
  /** เนื้อหา */
  children: React.ReactNode
}

export interface ModalCloseProps extends ButtonProps {
  "aria-label"?: string
}

const defaultContainer = typeof window !== "undefined" ? document.body : null

// หารายการ element ที่โฟกัสได้
const getFocusable = (root: HTMLElement | null) => {
  if (!root) return [] as HTMLElement[]
  const selectors = [
    "a[href]",
    "area[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type=hidden])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "iframe",
    "audio[controls]",
    "video[controls]",
    "[tabindex]:not([tabindex='-1'])",
    "[contenteditable=true]",
  ]
  return Array.from(root.querySelectorAll<HTMLElement>(selectors.join(","))).filter(
    (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
  )
}

export const Modal = ({
  open,
  onOpenChange,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  id,
  container = defaultContainer,
  className = "",
  initialFocusRef,
  size = "md",
  children,
}: ModalProps) => {
  const overlayRef = React.useRef<HTMLDivElement | null>(null)
  const panelRef = React.useRef<HTMLDivElement | null>(null)
  const lastFocusedRef = React.useRef<Element | null>(null)

  // ล็อกสกอลล์ของ body เมื่อเปิด
  React.useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  // เก็บ element ที่โฟกัสก่อนเปิด และ restore เมื่อปิด
  React.useEffect(() => {
    if (open) {
      lastFocusedRef.current = document.activeElement
    } else {
      if (lastFocusedRef.current instanceof HTMLElement) {
        lastFocusedRef.current.focus({ preventScroll: true })
      }
    }
  }, [open])

  // โฟกัสเริ่มต้น + โฟกัสทรัป
  React.useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return

    const toFocus =
      initialFocusRef?.current || getFocusable(panel)[0] || panel
    toFocus?.focus({ preventScroll: true })

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEsc) {
        e.stopPropagation()
        onOpenChange(false)
        return
      }
      if (e.key === "Tab") {
        const focusables = getFocusable(panel)
        if (focusables.length === 0) {
          e.preventDefault()
          panel.focus()
          return
        }
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        const active = document.activeElement as HTMLElement | null

        if (e.shiftKey) {
          // Shift + Tab
          if (active === first || !panel.contains(active)) {
            e.preventDefault()
            last.focus()
          }
        } else {
          // Tab
          if (active === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown, true)
    return () => document.removeEventListener("keydown", handleKeyDown, true)
  }, [open, closeOnEsc, onOpenChange, initialFocusRef])

  if (!container || !open) return null

  const sizeClass =
    {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-xl",
      xl: "max-w-2xl",
      full: "max-w-[min(100vw,100rem)]",
    }[size] || "max-w-md"

  return createPortal(
    <div
      id={id}
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-[1000] flex items-center justify-center ${className}`}
    >
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onMouseDown={(e) => {
          if (!closeOnOverlayClick) return
          // ปิดเฉพาะถ้าคลิกจริงๆ ที่ overlay (ไม่ใช่ลากจาก panel)
          if (e.target === overlayRef.current) {
            onOpenChange(false)
          }
        }}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        className={`relative z-[1001] w-full ${sizeClass} mx-4 rounded-md bg-white shadow-xl outline-none focus:outline-none`}
        tabIndex={-1}
        onMouseDown={(e) => {
          // ป้องกันการลากแล้วปล่อยเมาส์ไปโดน overlay ทำให้ปิด
          e.stopPropagation()
        }}
      >
        {children}
      </div>
    </div>,
    container
  )
}

/* ---------- Subcomponents ---------- */

export const ModalHeader = ({ className = "", ...props }: DivProps) => (
  <div
    className={`p-4 border-b flex items-start justify-between gap-4 ${className}`}
    {...props}
  />
)

export const ModalTitle = ({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-lg font-semibold leading-6 ${className}`} {...props} />
)

export const ModalDescription = ({ className = "", ...props }: DivProps) => (
  <div className={`text-sm text-gray-600 ${className}`} {...props} />
)

export const ModalBody = ({ className = "", ...props }: DivProps) => (
  <div className={`p-4 ${className}`} {...props} />
)

export const ModalFooter = ({ className = "", ...props }: DivProps) => (
  <div
    className={`flex flex-col-reverse gap-2 p-4 border-t sm:flex-row sm:justify-end ${className}`}
    {...props}
  />
)

/** ปุ่มปิดที่ตั้งค่า aria-label ให้เรียบร้อย */
export const ModalClose = ({
  className = "text-red-500 hover:text-red-900 ml-auto",
  onClick,
  "aria-label": ariaLabel = "Close",
  variant = "", // ตั้งค่าเริ่มต้นให้เป็น ghost
  size = "",     // ตั้งค่าเริ่มต้นให้เป็นปุ่ม icon
  children = "✕",    // ถ้าไม่ส่ง children มา ให้แสดง ✕
  ...props
}: ModalCloseProps) => (
  <Button
    type="button"
    aria-label={ariaLabel}
    onClick={onClick}
    variant={variant}
    size={size}
    className={className}
    {...props}
  >
    {children}
  </Button>
)

/** เสริม: แถบ overlay แยก (ถ้าต้องการวางเอง) */
export const ModalOverlay = ({ className = "", ...props }: DivProps) => (
  <div
    className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${className}`}
    {...props}
  />
)

Modal.Header = ModalHeader
Modal.Title = ModalTitle
Modal.Description = ModalDescription
Modal.Body = ModalBody
Modal.Footer = ModalFooter
Modal.Close = ModalClose
Modal.Overlay = ModalOverlay

export default Modal
