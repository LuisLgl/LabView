'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  LogIn,
  ArrowRight,
  Sun,
  Moon,
  Shield,
  Eye,
  EyeOff,
  User,
  KeyRound,
  UserPlus
} from 'lucide-react';
import { useLab } from '@/context/LabContext';

export default function StudentLoginPage() {
  const router = useRouter();
  const {
    loginAsAluno,
    theme,
    toggleTheme,
    showToast
  } = useLab();

  // Login States
  const [identificacao, setIdentificacao] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAlunoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identificacao.trim() || !senha.trim()) {
      showToast('Preencha sua identificação e senha.', 'error');
      return;
    }

    setIsLoading(true);
    const success = loginAsAluno(identificacao.trim(), senha.trim());
    setIsLoading(false);

    if (success) {
      router.push('/portal-aluno');
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

      {/* Card Principal - Área do Estudante */}
      <div className="login-card">
        
        {/* Cabeçalho */}
        <div className="login-header">
          <div className="login-icon-badge">
            <GraduationCap style={{ width: 34, height: 34 }} />
          </div>
          
          <span className="login-header-sub1">
            LabView UFPI • CSHNB Picos
          </span>
          
          <h1 className="login-header-title">
            Área do Estudante
          </h1>
          
          <p className="login-header-sub2">
            Ponto diário, uso de computadores e solicitações
          </p>
        </div>

        {/* Corpo do Formulário de Login */}
        <div className="login-body">
          <form onSubmit={handleAlunoSubmit} className="login-form">
            
            {/* Campo 1: Matrícula ou Nome */}
            <div className="login-field">
              <label className="login-label">
                Matrícula ou Nome do Aluno:
              </label>
              <div className="login-input-wrap">
                <input
                  type="text"
                  required
                  placeholder="Seu nome ou matrícula"
                  value={identificacao}
                  onChange={(e) => setIdentificacao(e.target.value)}
                  className="login-input"
                  autoFocus
                />
                <div className="login-input-icon">
                  <User style={{ width: 18, height: 18, color: 'var(--primary)' }} />
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
                  Acesso Pessoal
                </span>
              </div>
              <div className="login-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Digite sua senha..."
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
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
              <span>{isLoading ? 'Entrando...' : 'Entrar na Área do Estudante'}</span>
            </button>
          </form>

          {/* Botão que leva para a Página Independente /cadastro */}
          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <Link
              href="/cadastro"
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
              <span>Novo Estudante? Criar Cadastro</span>
            </Link>
          </div>

          {/* Link para Acesso Administrativo */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1.5px solid var(--border-color)', textAlign: 'center' }}>
            <Link
              href="/admin"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}
              className="hover:text-[var(--primary)] transition-colors"
            >
              <Shield style={{ width: 15, height: 15 }} />
              <span>Acesso do Professor / Administrador</span>
              <ArrowRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
