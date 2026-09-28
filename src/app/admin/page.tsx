'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  LogIn,
  Mail,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ArrowRight,
  GraduationCap,
  UserPlus,
  KeyRound
} from 'lucide-react';
import { useLab } from '@/context/LabContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const {
    loginAsAdmin,
    theme,
    toggleTheme,
    showToast
  } = useLab();

  // Login States
  const [adminEmail, setAdminEmail] = useState('');
  const [adminSenha, setAdminSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminSenha.trim()) {
      showToast('Preencha seu e-mail e sua senha de administrador.', 'error');
      return;
    }
    setIsLoading(true);
    const success = loginAsAdmin(adminEmail.trim(), adminSenha.trim());
    setIsLoading(false);
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="login-container">
      
      {/* Botão Superior de Tema */}
      <div className="login-theme-bar">
        <button
          onClick={toggleTheme}
          type="button"
          className="login-theme-btn"
          title="Alternar Modo Claro / Escuro"
        >
          {theme === 'theme-dark' ? (
            <>
              <Sun style={{ width: 16, height: 16, color: '#FBBF24' }} />
              <span style={{ color: '#FDE68A' }}>Modo Claro</span>
            </>
          ) : (
            <>
              <Moon style={{ width: 16, height: 16, color: '#6342F5' }} />
              <span style={{ color: '#4E2FE0' }}>Modo Escuro</span>
            </>
          )}
        </button>
      </div>

      {/* Card Principal - Administrador */}
      <div className="login-card">
        
        {/* Cabeçalho */}
        <div className="login-header">
          <div className="login-icon-badge">
            <ShieldCheck style={{ width: 34, height: 34 }} />
          </div>
          
          <span className="login-header-sub1">
            LabView UFPI • CSHNB Picos
          </span>
          
          <h1 className="login-header-title">
            Painel Administrativo
          </h1>
          
          <p className="login-header-sub2">
            Gestão do Laboratório • Controle de PCs, Ocorrências & Relatórios
          </p>
        </div>

        {/* Corpo do Formulário */}
        <div className="login-body">
          <form onSubmit={handleAdminSubmit} className="login-form">
            
            {/* Campo 1: E-mail do Administrador */}
            <div className="login-field">
              <label className="login-label">
                E-mail Institucional:
              </label>
              <div className="login-input-wrap">
                <input
                  type="email"
                  required
                  placeholder="ex: admin@ufpi.edu.br"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="login-input"
                  autoFocus
                />
                <div className="login-input-icon">
                  <Mail style={{ width: 18, height: 18, color: 'var(--primary)' }} />
                </div>
              </div>
            </div>

            {/* Campo 2: Senha */}
            <div className="login-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="login-label" style={{ marginBottom: 0 }}>
                  Senha de Acesso:
                </label>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Acesso Restrito
                </span>
              </div>
              <div className="login-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Digite sua senha de administrador..."
                  value={adminSenha}
                  onChange={(e) => setAdminSenha(e.target.value)}
                  className="login-input"
                  style={{ paddingRight: 42 }}
                />
                <div className="login-input-icon">
                  <KeyRound style={{ width: 18, height: 18, color: 'var(--primary)' }} />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 4
                  }}
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff style={{ width: 17, height: 17 }} /> : <Eye style={{ width: 17, height: 17 }} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="login-submit-btn">
              <LogIn style={{ width: 20, height: 20 }} />
              <span>{isLoading ? 'Autenticando...' : 'Entrar no Painel Administrativo'}</span>
            </button>
          </form>

          {/* Botão que leva para a Página Independente de Cadastro de Administrador */}
          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <Link
              href="/admin/cadastro"
              className="btn btn-secondary"
              style={{
                width: '100%',
                fontSize: '0.82rem',
                padding: '11px 16px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                textDecoration: 'none'
              }}
            >
              <UserPlus style={{ width: 16, height: 16, color: 'var(--primary)' }} />
              <span>Solicitar Novo Cadastro de Administrador / Monitor</span>
            </Link>
          </div>

          {/* Link para Acesso do Aluno */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1.5px solid var(--border-color)', textAlign: 'center' }}>
            <Link
              href="/"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}
              className="hover:text-[var(--primary)] transition-colors"
            >
              <GraduationCap style={{ width: 15, height: 15 }} />
              <span>Ir para a Área do Estudante</span>
              <ArrowRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
