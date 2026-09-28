'use client';

import React from 'react';
import { useLab } from '@/context/LabContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function ToastContainer() {
  const { toasts } = useLab();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-l-4 border-l-[var(--primary)]';
        let Icon = Info;
        let iconColor = 'text-[var(--primary)]';

        if (toast.type === 'success') {
          borderClass = 'border-l-4 border-l-[var(--status-available)]';
          Icon = CheckCircle2;
          iconColor = 'text-[var(--status-available)]';
        } else if (toast.type === 'error') {
          borderClass = 'border-l-4 border-l-[var(--status-maintenance)]';
          Icon = AlertCircle;
          iconColor = 'text-[var(--status-maintenance)]';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] p-4 rounded-[12px] shadow-lg text-xs font-semibold animate-fade-in ${borderClass}`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
            <span className="flex-1">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
