import { toast as reactHotToast } from "react-hot-toast"

export interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

export function useToast() {
  const toasts: Toast[] = []

  const toast = (props: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    
    if (props.variant === "destructive") {
      reactHotToast.error(props.title || props.description || "Error")
    } else {
      reactHotToast.success(props.title || props.description || "Success")
    }
    
    return {
      id,
      dismiss: () => reactHotToast.dismiss(id),
      update: (newProps: Partial<Toast>) => {
        // For now, just show a new toast
        toast({ ...props, ...newProps })
      }
    }
  }

  return {
    toast,
    toasts,
    dismiss: (toastId?: string) => {
      if (toastId) {
        reactHotToast.dismiss(toastId)
      } else {
        reactHotToast.dismiss()
      }
    }
  }
}

export { toast } from "react-hot-toast"
