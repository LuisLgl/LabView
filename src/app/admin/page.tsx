
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
  KeyRound,
  Loader2,
} from 'lucide-react';

import { useLab } from '@/context/LabContext';

export default function AdminLoginPage() {
  const router = useRouter();

  const {
    loginAsAdmin,
    theme,
    toggleTheme,
    showToast,
  } = useLab();

  const [adminEmail, setAdminEmail] = useState('');
  const [adminSenha, setAdminSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const email = adminEmail.trim().toLowerCase();

    if (!email || !adminSenha) {
      showToast(
        'Preencha seu e-mail e sua senha.',
        'error'
      );
      return;
    }

    setIsLoading(true);

    try {
      const sucesso = await loginAsAdmin(email, adminSenha);

      if (sucesso) {
        showToast(
          'Login realizado com sucesso!',
          'success'
        );

        router.push('/dashboard');
      } else {
        showToast(
          'E-mail ou senha inválidos, ou cadastro ainda não aprovado.',
          'error'
        );
      }
    } catch (error) {
      console.error('Erro no login administrativo:', error);

      showToast(
        'Não foi possível realizar o login. Tente novamente.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">

      {/* Alternância de tema */}
      <div className="login-theme-bar">
        <button
          onClick={toggleTheme}
          type="button"
          className="login-theme-btn"
          title="Alternar modo claro ou escuro"
        >
          {theme === 'theme-dark' ? (
            <>
              <Sun
                style={{
                  width: 16,
                  height: 16,
                  color: '#FBBF24',
                }}
              />
              <span style={{ color: '#FDE68A' }}>
                Modo Claro
              </span>
            </>
          ) : (
            <>
              <Moon
                style={{
                  width: 16,
                  height: 16,
                  color: '#6342F5',
                }}
              />
              <span style={{ color: '#4E2FE0' }}>
                Modo Escuro
              </span>
            </>
          )}
        </button>
      </div>

      {/* Card de login */}
      <div className="login-card">

        {/* Cabeçalho */}
        <div className="login-header">
          <div className="login-icon-badge">
            <ShieldCheck
              style={{
                width: 34,
                height: 34,
              }}
            />
          </div>

          <span className="login-header-sub1">
            LabView UFPI • CSHNB Picos
          </span>

          <h1 className="login-header-title">
            Painel Administrativo
          </h1>

          <p className="login-header-sub2">
            Gestão do Laboratório • Controle de PCs,
            Ocorrências e Relatórios
          </p>
        </div>

        {/* Formulário */}
        <div className="login-body">
          <form
            onSubmit={handleAdminSubmit}
            className="login-form"
          >

            {/* E-mail */}
            <div className="login-field">
              <label className="login-label">
                E-mail Institucional:
              </label>

              <div className="login-input-wrap">
                <input
                  type="email"
                  required
                  autoComplete="username"
                  placeholder="ex: admin@ufpi.edu.br"
                  value={adminEmail}
                  onChange={(e) =>
                    setAdminEmail(e.target.value)
                  }
                  className="login-input"
                  autoFocus
                  disabled={isLoading}
                />

                <div className="login-input-icon">
                  <Mail
                    style={{
                      width: 18,
                      height: 18,
                      color: 'var(--primary)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Senha */}
            <div className="login-field">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <label className="login-label">
                  Senha de Acesso:
                </label>

                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  Acesso Restrito
                </span>
              </div>

              <div className="login-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Digite sua senha..."
                  value={adminSenha}
                  onChange={(e) =>
                    setAdminSenha(e.target.value)
                  }
                  className="login-input"
                  style={{ paddingRight: 76 }}
                  disabled={isLoading}
                />

                <div className="login-input-icon">
                  <KeyRound
                    style={{
                      width: 18,
                      height: 18,
                      color: 'var(--primary)',
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  disabled={isLoading}
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
                    padding: 4,
                  }}
                  title={
                    showPassword
                      ? 'Ocultar senha'
                      : 'Exibir senha'
                  }
                  aria-label={
                    showPassword
                      ? 'Ocultar senha'
                      : 'Exibir senha'
                  }
                >
                  {showPassword ? (
                    <EyeOff
                      style={{
                        width: 17,
                        height: 17,
                      }}
                    />
                  ) : (
                    <Eye
                      style={{
                        width: 17,
                        height: 17,
                      }}
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Entrar */}
            <button
              type="submit"
              disabled={isLoading}
              className="login-submit-btn"
            >
              {isLoading ? (
                <Loader2
                  className="animate-spin"
                  style={{
                    width: 20,
                    height: 20,
                  }}
                />
              ) : (
                <LogIn
                  style={{
                    width: 20,
                    height: 20,
                  }}
                />
              )}

              <span>
                {isLoading
                  ? 'Autenticando...'
                  : 'Entrar no Painel Administrativo'}
              </span>
            </button>
          </form>

          {/* Cadastro administrativo */}
          <div
            style={{
              marginTop: 14,
              textAlign: 'center',
            }}
          >
            <Link
              href="/admin/cadastro"
              className="btn btn-secondary"
              style={{
                width: '100%',
                fontSize: '0.82rem',
                padding: '11px 16px',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                textDecoration: 'none',
              }}
            >
              <UserPlus
                style={{
                  width: 16,
                  height: 16,
                  color: 'var(--primary)',
                }}
              />

              <span>
                Solicitar Cadastro de Monitor
              </span>
            </Link>
          </div>

          {/* Acesso do estudante */}
          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1.5px solid var(--border-color)',
              textAlign: 'center',
            }}
          >
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
              }}
              className="hover:text-[var(--primary)] transition-colors"
            >
              <GraduationCap
                style={{
                  width: 15,
                  height: 15,
                }}
              />

              <span>
                Ir para a Área do Estudante
              </span>

              <ArrowRight
                style={{
                  width: 13,
                  height: 13,
                }}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
