"use client"

import * as React from "react"
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "efeitos/dialog"
import { Component as PlasticButton } from "efeitos/button-plastic"

export type AlertType = "success" | "error" | "warning" | "info"
export type AlertLayout = "vertical" | "horizontal"

interface AlertDialogState {
  open: boolean
  title: string
  description?: string
  type: AlertType
  layout?: AlertLayout
  mediaSrc?: string
  mediaAlt?: string
  mediaNode?: React.ReactNode
  hideTypeIcon?: boolean
  onConfirm?: () => void
  onCancel?: () => void
  showCancel?: boolean
  confirmText?: string
  cancelText?: string
}

interface AlertDialogContextType {
  alert: (options: Omit<AlertDialogState, "open">) => void
  success: (title: string, description?: string, onConfirm?: () => void) => void
  error: (title: string, description?: string, onConfirm?: () => void) => void
  warning: (title: string, description?: string, onConfirm?: () => void) => void
  info: (title: string, description?: string, onConfirm?: () => void) => void
  confirm: (title: string, description: string, onConfirm: () => void) => void
  close: () => void
}

const AlertDialogContext = React.createContext<AlertDialogContextType | undefined>(undefined)

export function useAlertDialog() {
  const context = React.useContext(AlertDialogContext)
  if (!context) {
    throw new Error("useAlertDialog must be used within an AlertDialogProvider")
  }
  return context
}

interface AlertDialogProviderProps {
  children: React.ReactNode
}

const eventTarget = typeof window !== 'undefined' ? new EventTarget() : null;

export const alertEvent = {
  trigger: (type: AlertType, title: string, description?: string, onConfirm?: () => void) => {
    eventTarget?.dispatchEvent(new CustomEvent('alert-trigger', { 
      detail: { type, title, description, onConfirm, showCancel: false, layout: "vertical" } 
    }));
  },
  confirm: (title: string, description: string, onConfirm: () => void) => {
    eventTarget?.dispatchEvent(new CustomEvent('alert-trigger', { 
      detail: { type: "warning", title, description, onConfirm, showCancel: true, layout: "vertical" } 
    }));
  }
};

export function AlertDialogProvider({ children }: AlertDialogProviderProps) {
  const [state, setState] = React.useState<AlertDialogState>({
    open: false,
    title: "",
    type: "info",
    layout: "vertical",
  })

  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setState({ ...detail, open: true });
    };
    eventTarget?.addEventListener('alert-trigger', handler);
    return () => eventTarget?.removeEventListener('alert-trigger', handler);
  }, []);

  const alert = React.useCallback((options: Omit<AlertDialogState, "open">) => {
    setState({ ...options, open: true })
  }, [])

  const close = React.useCallback(() => {
    setState(prev => ({ ...prev, open: false }))
  }, [])

  const success = React.useCallback((title: string, description?: string, onConfirm?: () => void) => {
    setState({ open: true, title, description, type: "success", onConfirm, showCancel: false, layout: "vertical" })
  }, [])

  const error = React.useCallback((title: string, description?: string, onConfirm?: () => void) => {
    setState({ open: true, title, description, type: "error", onConfirm, showCancel: false, layout: "vertical" })
  }, [])

  const warning = React.useCallback((title: string, description?: string, onConfirm?: () => void) => {
    setState({ open: true, title, description, type: "warning", onConfirm, showCancel: false, layout: "vertical" })
  }, [])

  const info = React.useCallback((title: string, description?: string, onConfirm?: () => void) => {
    setState({ open: true, title, description, type: "info", onConfirm, showCancel: false, layout: "vertical" })
  }, [])

  const confirm = React.useCallback((title: string, description: string, onConfirm: () => void) => {
    setState({ open: true, title, description, type: "warning", onConfirm, showCancel: true, layout: "vertical" })
  }, [])

  const handleConfirm = () => {
    state.onConfirm?.()
    close()
  }

  const handleCancel = () => {
    state.onCancel?.()
    close()
  }

  const iconMap = {
    success: <CheckCircle className="h-12 w-12 text-green-500" />,
    error: <XCircle className="h-12 w-12 text-red-500" />,
    warning: <AlertCircle className="h-12 w-12 text-amber-500" />,
    info: <Info className="h-12 w-12 text-blue-500" />,
  }

  const iconBgMap = {
    success: "bg-green-500/10",
    error: "bg-red-500/10",
    warning: "bg-amber-500/10",
    info: "bg-blue-500/10",
  }

  const mediaElement = state.mediaNode
    ? state.mediaNode
    : state.mediaSrc
      ? <img src={state.mediaSrc} alt={state.mediaAlt ?? "Ilustração"} className="h-24 w-24 object-contain" />
      : (!state.hideTypeIcon
        ? (
            <div className={cn("flex h-16 w-16 items-center justify-center rounded-full", iconBgMap[state.type])}>
              <img src="/assets/alerta.png" alt="Alerta" className="h-10 w-10 object-contain" />
            </div>
          )
        : null)

  const isHorizontal = state.layout === "horizontal"

  return (
    <AlertDialogContext.Provider value={{ alert, success, error, warning, info, confirm, close }}>
      {children}
      <Dialog open={state.open} onOpenChange={(open) => !open && close()}>
        <DialogContent className={cn("max-w-sm", isHorizontal && "max-w-md")}>
          <DialogHeader className={cn("text-center", isHorizontal ? "flex-row items-center gap-4 text-left" : "flex-col items-center")}>
            {mediaElement && <div className={cn(isHorizontal ? "shrink-0" : "mb-3")}>{mediaElement}</div>}
            <div className="flex-1">
              <DialogTitle className="text-lg">{state.title}</DialogTitle>
              {state.description && (
                <DialogDescription className={cn(isHorizontal ? "text-left" : "text-center")}>
                  {state.description}
                </DialogDescription>
              )}
            </div>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <PlasticButton
              type="button"
              label={state.confirmText || "OK"}
              onClick={handleConfirm}
              className="w-full"
            />
            {state.showCancel && (
              <PlasticButton
                type="button"
                label={state.cancelText || "Cancelar"}
                onClick={handleCancel}
                variant="secondary"
                className="w-full"
              />
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AlertDialogContext.Provider>
  )
}