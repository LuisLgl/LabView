'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  className = ''
}: SearchInputProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3.5 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9.5 pr-9 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[12px] text-xs font-medium text-[var(--text-main)] placeholder:text-[var(--text-light)] focus:outline-none focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--primary-glow)] transition-all"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 w-4 h-4 text-[var(--text-light)] hover:text-[var(--text-main)]"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
