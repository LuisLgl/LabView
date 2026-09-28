'use client';

import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  icon,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-[var(--border-color)] rounded-[16px] bg-[var(--bg-card-subtle)] my-2">
      <div className="w-12 h-12 rounded-[14px] bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center mb-3">
        {icon || <Inbox className="w-6 h-6 opacity-80" />}
      </div>
      <h3 className="font-bold text-sm text-[var(--text-main)]">{title}</h3>
      {description && (
        <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
