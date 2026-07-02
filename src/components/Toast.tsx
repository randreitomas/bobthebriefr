import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: number
  text: string
  type: ToastType
}

interface Props {
  toast: ToastMessage | null
  onDismiss: () => void
}

export function Toast({ toast, onDismiss }: Props) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(onDismiss, 3200)
    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  if (!toast) return null

  return (
    <div className={`toast toast--${toast.type}`} role="status" aria-live="polite">
      {toast.text}
    </div>
  )
}
