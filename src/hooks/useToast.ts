"use client";

import { useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  type: ToastType;
  msg: string;
}

let nextId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((type: ToastType, msg: string, duration = 3500) => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, type, msg }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const success = useCallback((msg: string) => show("success", msg), [show]);
  const error = useCallback((msg: string) => show("error", msg), [show]);
  const info = useCallback((msg: string) => show("info", msg), [show]);

  return { toasts, success, error, info };
}
