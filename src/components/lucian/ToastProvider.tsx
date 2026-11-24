"use client";

/* Inspired by Lucian UX/UI Prompt #070 · MIT License (c) 2026 Seokwoooo */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "info";

interface ToastItem {
  id: string;
  kind: ToastKind;
  title: string;
  description?: string;
}

interface ToastContextValue {
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      success: () => "",
      error: () => "",
      info: () => "",
      dismiss: () => {},
    };
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [expanded, setExpanded] = useState(false);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const dragStartX = useRef<Record<string, number>>({});
  const [dragDelta, setDragDelta] = useState<Record<string, number>>({});

  const dismiss = useCallback((id: string) => {
    const t = timersRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const scheduleDismiss = useCallback(
    (id: string) => {
      const prev = timersRef.current.get(id);
      if (prev) clearTimeout(prev);
      const timer = setTimeout(() => dismiss(id), 4200);
      timersRef.current.set(id, timer);
    },
    [dismiss]
  );

  useEffect(() => {
    const map = timersRef.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
      map.clear();
    };
  }, []);

  // Pause auto-dismiss while user hovers/fans the stack
  useEffect(() => {
    if (expanded) {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    } else {
      toasts.forEach((item) => scheduleDismiss(item.id));
    }
  }, [expanded, toasts, scheduleDismiss]);

  const push = useCallback(
    (kind: ToastKind, title: string, description?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [{ id, kind, title, description }, ...prev].slice(0, 4));
      return id;
    },
    []
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (title, desc) => push("success", title, desc),
      error: (title, desc) => push("error", title, desc),
      info: (title, desc) => push("info", title, desc),
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          aria-label="Thông báo hệ thống"
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          className="fixed right-4 bottom-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col-reverse items-stretch gap-2"
        >
          {toasts.map((item, idx) => {
            const offset = expanded ? 0 : idx * 10;
            const scale = expanded ? 1 : Math.max(0.88, 1 - idx * 0.05);
            const opacity = expanded ? 1 : Math.max(0.55, 1 - idx * 0.18);
            const dx = dragDelta[item.id] ?? 0;

            const icon =
              item.kind === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ux-mint)]" />
              ) : item.kind === "error" ? (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ux-danger)]" />
              ) : (
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ux-accent)]" />
              );

            return (
              <div
                key={item.id}
                role="status"
                onPointerDown={(e) => {
                  dragStartX.current[item.id] = e.clientX;
                }}
                onPointerMove={(e) => {
                  const start = dragStartX.current[item.id];
                  if (start === undefined) return;
                  const diff = e.clientX - start;
                  if (Math.abs(diff) > 4) {
                    setDragDelta((d) => ({ ...d, [item.id]: diff }));
                  }
                }}
                onPointerUp={() => {
                  const diff = dragDelta[item.id] ?? 0;
                  delete dragStartX.current[item.id];
                  setDragDelta((d) => {
                    const next = { ...d };
                    delete next[item.id];
                    return next;
                  });
                  if (Math.abs(diff) > 72) {
                    dismiss(item.id);
                  }
                }}
                style={{
                  transform: expanded
                    ? `translateX(${dx}px)`
                    : `translate3d(${dx}px, ${offset}px, 0) scale(${scale})`,
                  opacity,
                  zIndex: toasts.length - idx,
                  marginBottom: expanded ? 0 : idx === 0 ? 0 : -54,
                  animation: "ux-toast-in 0.34s var(--ux-spring) both",
                  transition:
                    "transform 0.36s var(--ux-spring), opacity 0.25s var(--ux-ease), margin-bottom 0.36s var(--ux-spring)",
                }}
                className="touch-pan-y select-none rounded-2xl border border-[var(--ux-line-2)] bg-[var(--ux-surface)] p-3.5 shadow-[0_14px_30px_-14px_var(--ux-shadow-strong)]"
              >
                <div className="flex items-start gap-2.5">
                  {icon}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--ux-ink)]">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="mt-0.5 text-xs leading-relaxed text-[var(--ux-ink-2)]">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(item.id)}
                    aria-label="Đóng thông báo"
                    className="rounded-lg p-1 text-[var(--ux-ink-3)] hover:bg-[var(--ux-surface-2)] hover:text-[var(--ux-ink)]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
}
