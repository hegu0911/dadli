import { useEffect, useState } from "react";
import { CloseIcon, CheckIcon, WarningIcon } from "./Icons";

// ---- Skeleton Components ----
export function SkeletonCard() {
  return (
    <div className="mb-4 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <div className="w-8 h-8 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="h-2 bg-gray-100 rounded w-16 mt-1" />
        </div>
      </div>
      <div className="w-full aspect-square bg-gray-100" />
      <div className="px-4 py-3 space-y-2">
        <div className="flex gap-4">
          <div className="h-6 w-6 bg-gray-200 rounded" />
          <div className="h-6 w-6 bg-gray-200 rounded" />
          <div className="h-6 w-6 bg-gray-200 rounded" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-20" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  );
}

export function SkeletonFeed() {
  return (
    <div className="pb-16">
      <div className="px-4 h-12 flex items-center animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32" />
      </div>
      <div className="flex gap-4 px-4 py-3 animate-pulse">
        {[1,2,3,4,5].map(i => <div key={i} className="flex flex-col items-center gap-1"><div className="w-16 h-16 rounded-full bg-gray-200" /><div className="h-2 bg-gray-200 rounded w-12" /></div>)}
      </div>
      <SkeletonCard /><SkeletonCard />
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="pb-16 animate-pulse">
      <div className="px-4 py-4 ig-divider">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-100 rounded w-24" />
          </div>
        </div>
        <div className="flex gap-8 mt-4">
          {[1,2,3].map(i => <div key={i} className="text-center"><div className="h-5 bg-gray-200 rounded w-10 mx-auto" /><div className="h-2 bg-gray-100 rounded w-12 mx-auto mt-1" /></div>)}
        </div>
      </div>
    </div>
  );
}

// ---- Toast System ----
interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

let toastListeners: ((toast: ToastItem) => void)[] = [];

export function showToast(message: string, type: "success" | "error" | "info" = "info") {
  const toast = { id: Date.now().toString(), message, type };
  toastListeners.forEach(fn => fn(toast));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (toast: ToastItem) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), 3500);
    };
    toastListeners.push(listener);
    return () => { toastListeners = toastListeners.filter(l => l !== listener); };
  }, []);

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(t => (
        <div key={t.id} className={`slide-up flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
          t.type === "success" ? "bg-green-500" : t.type === "error" ? "bg-red-500" : "bg-gray-800"
        }`}>
          <span>{t.type === "success" ? <CheckIcon size={16} /> : <WarningIcon size={16} />}</span>
          <span className="flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)} className="opacity-70 hover:opacity-100"><CloseIcon size={14} /></button>
        </div>
      ))}
    </div>
  );
}

// ---- Modal ----
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 slide-up max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><CloseIcon size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ---- Error / Empty States ----
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <WarningIcon size={24} className="text-red-500" />
      </div>
      <p className="text-gray-600 font-medium mb-1">{message}</p>
      {onRetry && <button onClick={onRetry} className="text-primary text-sm font-semibold mt-2">Yenidən cəhd et</button>}
    </div>
  );
}

export function EmptyState({ icon, title, subtitle, action }: { icon: string; title: string; subtitle?: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <p className="text-6xl mb-4">{icon}</p>
      <p className="font-semibold text-gray-700 text-lg">{title}</p>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      {action && <button onClick={action.onClick} className="btn-primary mt-4 text-sm">{action.label}</button>}
    </div>
  );
}
