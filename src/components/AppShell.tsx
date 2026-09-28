'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import ToastContainer from '@/components/ToastContainer';
import { Cpu, Sun, Moon, LogOut, GraduationCap, Shield } from 'lucide-react';
import { useLab } from '@/context/LabContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, loggedAluno, logout } = useLab();

  // As telas de autenticação e cadastro rodam sem sidebar
  const isLoginPage = pathname === '/' || pathname === '/login' || pathname === '/admin' || pathname === '/cadastro' || pathname === '/admin/cadastro' || pathname === '/admin-cadastro';

  // O portal do aluno roda como uma página isolada dedicada
  const isStudentPortal = pathname === '/portal-aluno';

  if (isLoginPage) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-between relative overflow-hidden bg-[var(--bg-app)]">
        {/* Ambient Glow Orbs */}
        <div className="auth-bg-ambient">
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
        </div>

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 w-full z-10 animate-fade-in">
          {children}
        </main>

        <footer className="py-4 px-6 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border-color)] bg-[var(--bg-card-glass)] backdrop-blur-md z-10">
          <strong>LabView UFPI</strong> • Sistema de Gestão de Laboratórios (CSHNB - Picos)
        </footer>
        <ToastContainer />
      </div>
    );
  }

  if (isStudentPortal) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-[var(--bg-app)]">
        {/* Topbar Dedicada do Estudante */}
        <header style={{
          height: '76px',
          background: 'var(--bg-card-glass)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1.5px solid var(--border-color)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px var(--primary-glow)'
            }}>
              <Cpu style={{ width: 24, height: 24 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, color: 'var(--primary)' }}>
                LabView UFPI • CSHNB Picos
              </span>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.2 }}>
                Área do Estudante
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={toggleTheme}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '8px 14px', borderRadius: '9999px' }}
              title="Alternar Tema"
            >
              {theme === 'theme-dark' ? <Sun style={{ width: 15, height: 15, color: '#FBBF24' }} /> : <Moon style={{ width: 15, height: 15, color: '#6342F5' }} />}
              <span style={{ fontWeight: 700 }}>{theme === 'theme-dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
            </button>

            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              style={{
                fontSize: '0.8rem',
                padding: '8px 16px',
                borderRadius: '9999px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#DC2626',
                border: '1.5px solid rgba(239, 68, 68, 0.3)',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Sair da Conta do Estudante"
            >
              <LogOut style={{ width: 15, height: 15 }} />
              <span>Sair da Conta</span>
            </button>
          </div>
        </header>

        {/* Conteúdo Isolado do Estudante */}
        <main style={{ flex: 1, padding: '24px 20px', maxWidth: '1100px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>

        <footer style={{
          padding: '16px 24px',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          borderTop: '1.5px solid var(--border-color)',
          background: 'var(--bg-card)'
        }}>
          <strong>LabView UFPI</strong> • Área do Estudante • CSHNB Picos
        </footer>
        <ToastContainer />
      </div>
    );
  }

  // Demais páginas administrativas com Sidebar completa
  return (
    <div className="flex min-h-screen bg-[var(--bg-app)]">
      <Sidebar />
      <div className="flex-1 ml-[270px] flex flex-col min-w-0 min-h-screen transition-all">
        <Topbar />
        <main className="flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto animate-fade-in">
          {children}
        </main>
        <footer className="px-8 py-4 bg-[var(--bg-card)] border-t border-[var(--border-color)] text-xs text-[var(--text-muted)] flex items-center justify-between flex-wrap gap-2">
          <span>
            <strong>LabView UFPI</strong> - Sistema de Gestão de Laboratórios (CSHNB - Picos)
          </span>
          <span>Desenvolvido por: Luis G. L. D. Ramos, Marcos Eduardo, Veron</span>
        </footer>
      </div>
      <ToastContainer />
    </div>
  );
}
