'use client';

import React from 'react';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'purple' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  pulse?: boolean;
}

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  pulse = false
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-[var(--status-available-bg)] text-[var(--status-available)] border-[var(--status-available-border)]',
    danger: 'bg-[var(--status-maintenance-bg)] text-[var(--status-maintenance)] border-[var(--status-maintenance-border)]',
    warning: 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning-border)]',
    purple: 'bg-[var(--status-occupied-bg)] text-[var(--status-occupied)] border-[var(--status-occupied-border)]',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    neutral: 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border-[var(--border-color)]'
  };

  const sizeStyles = {
    sm: 'text-[0.65rem] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {pulse && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'success'
              ? 'bg-emerald-500 animate-ping'
              : variant === 'danger'
              ? 'bg-red-500 animate-ping'
              : 'bg-purple-500 animate-ping'
          }`}
        />
      )}
      {icon}
      <span>{children}</span>
    </span>
  );
}
