"use client"

import { useTheme } from 'next-themes'
import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  const { theme } = useTheme()

  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        className: "!bg-background !text-foreground !border-border !rounded-md",
      }}
      theme={theme as "light" | "dark" | "system"}
      closeButton
    />
  )
} 