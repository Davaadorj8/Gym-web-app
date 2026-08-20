'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { hideToast } from '@/features/ui/uiSlice';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const dispatch = useAppDispatch();
  const toast = useAppSelector((state) => state.ui.toastNotification);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-950 text-white rounded-xl shadow-xl border border-zinc-800 text-xs font-medium max-w-sm">
        {getIcon()}
        <span className="flex-1 leading-snug">{toast.message}</span>
        <button
          onClick={() => dispatch(hideToast())}
          className="text-zinc-400 hover:text-white p-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
