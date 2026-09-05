import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export const useToast = () => useContext(ToastContext);

const ICONS: Record<ToastType, React.FC<{ className?: string }>> = {
  success: CheckCircle2,
  error:   XCircle,
  warning: AlertCircle,
  info:    Info,
};

const COLORS: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: { bg: "bg-emerald-50",  icon: "text-emerald-600", border: "border-emerald-200" },
  error:   { bg: "bg-rose-50",     icon: "text-rose-600",    border: "border-rose-200"    },
  warning: { bg: "bg-amber-50",    icon: "text-amber-600",   border: "border-amber-200"   },
  info:    { bg: "bg-indigo-50",   icon: "text-indigo-600",  border: "border-indigo-200"  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          const c    = COLORS[t.type];
          return (
            <div
              key={t.id}
              className={`
                pointer-events-auto flex items-start gap-3 min-w-[280px] max-w-[360px]
                ${c.bg} ${c.border} border rounded-xl px-4 py-3
                shadow-lg animate-toast-in
              `}
            >
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${c.icon}`} />
              <p className="text-xs font-medium text-slate-800 flex-1 leading-relaxed">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
