// src/components/Toast.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
}

interface ToastCtx {
  push: (kind: ToastKind, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  const value: ToastCtx = {
    push,
    success: (m) => push("success", m),
    error: (m) => push("error", m),
    info: (m) => push("info", m),
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[200] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast doit être dans <ToastProvider>");
  return ctx;
}

function ToastItem({ toast }: { toast: Toast }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const icon =
    toast.kind === "success" ? "✓" : toast.kind === "error" ? "!" : "i";
  const color =
    toast.kind === "success"
      ? "bg-[#16a34a]"
      : toast.kind === "error"
      ? "bg-rose-500"
      : "bg-sky-500";

  return (
    <div
      className={`pointer-events-auto flex max-w-md items-start gap-2.5 rounded-full border border-black/10 bg-black px-4 py-2.5 text-[13px] font-medium text-white shadow-2xl transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      }`}
    >
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${color} text-[11px] font-bold`}>
        {icon}
      </span>
      <span>{toast.message}</span>
    </div>
  );
}