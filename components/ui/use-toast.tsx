"use client"

import { useState, useEffect, useCallback } from "react"
import { toast, Toast as SonnerToast } from "sonner"

type ToastProps = SonnerToast & {
  id?: string | number
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const dismiss = useCallback((toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId)
      setToasts((toasts) => toasts.filter((toast) => toast.id !== toastId))
    }
  }, [])

  const dismissAll = useCallback(() => {
    toast.dismiss()
    setToasts([])
  }, [])

  function custom(props: ToastProps) {
    const id = props.id || Date.now()
    const newToast = { ...props, id }
    
    setToasts((toasts) => [...toasts, newToast])
    
    toast(props.title || "", {
      ...props,
      id,
    })
    
    return id
  }

  function success(props: ToastProps) {
    return custom({
      ...props,
      variant: "success",
    })
  }

  function error(props: ToastProps) {
    return custom({
      ...props,
      variant: "destructive",
    })
  }

  function warning(props: ToastProps) {
    return custom({
      ...props,
      variant: "warning",
    })
  }

  function info(props: ToastProps) {
    return custom({
      ...props,
      variant: "info",
    })
  }

  return {
    toast: {
      ...toast,
      dismiss,
      dismissAll,
      custom,
      success,
      error,
      warning,
      info,
    },
    toasts,
  }
} 