'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'md'
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWStyle = {
    sm: '480px',
    md: '580px',
    lg: '720px',
    xl: '900px'
  }[maxWidth];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        style={{
          position: 'fixed',
          inset: 0,
          cursor: 'pointer'
        }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: maxWStyle,
          backgroundColor: 'var(--bg-card)',
          border: '1.8px solid var(--border-color)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 30px rgba(99, 66, 245, 0.15)',
          padding: '24px 28px',
          zIndex: 10000,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Cabeçalho do Modal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            paddingBottom: '16px',
            borderBottom: '1.5px solid var(--border-color)',
            marginBottom: '20px',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {icon && (
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(99, 66, 245, 0.15)'
                }}
              >
                {icon}
              </div>
            )}
            <div>
              <h3
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  color: 'var(--text-main)',
                  lineHeight: 1.25,
                  margin: 0
                }}
              >
                {title}
              </h3>
              {subtitle && (
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    marginTop: '4px',
                    marginBottom: 0,
                    lineHeight: 1.35
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card-subtle)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
            title="Fechar (Esc)"
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Corpo com Scroll Suave */}
        <div
          style={{
            overflowY: 'auto',
            paddingRight: '6px',
            paddingBottom: '4px'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
