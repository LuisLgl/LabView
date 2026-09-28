'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: React.ReactNode;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  valueColor?: string;
  badge?: string;
}

export default function StatCard({
  title,
  value,
  subtext,
  icon,
  iconBgColor = 'bg-[var(--primary-light)]',
  iconColor = 'text-[var(--primary)]',
  valueColor = 'text-[var(--text-main)]',
  badge
}: StatCardProps) {
  return (
    <div className="card hover:-translate-y-1 transition-all duration-200 border-[var(--border-color)] relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              {title}
            </h4>
            {badge && (
              <span className="badge-tag bg-[var(--primary-light)] text-[var(--primary)] text-[0.65rem] px-2 py-0.5">
                {badge}
              </span>
            )}
          </div>
          <div className={`text-3xl font-extrabold my-2 ${valueColor}`}>
            {value}
          </div>
          {subtext && (
            <div className="text-xs flex items-center gap-1.5 font-medium">
              {subtext}
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-[14px] ${iconBgColor} ${iconColor} flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-110`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
