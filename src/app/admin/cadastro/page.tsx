'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldPlus,
  ShieldCheck,
  User,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useLab } from '@/context/LabContext';
import { UserRole } from '@/types';

export default function AdminRegisterPage() {
  const router = useRouter();
  const {
    solicitarCadastroUsuario,
    aprovarUsuario,
    theme,
    toggleTheme,
    showToast
  } = useLab();

  // Step: 'form' | 'confirm'
  const [step, setStep] = useState<'form' | 'confirm'>('form');

  // Form States
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState<UserRole>('Administrador');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Confirmation States
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [lastGeneratedCode, setLastGeneratedCode] = useState<string | null>(null);
  const [confirmationCodeInput, setConfirmationCodeInput] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const handleSubmitRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      showToast('Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    setIsLoading(true);
    const { user, confirmationCode } = solicitarCadastroUsuario({
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senha: senha.trim(),
      perfil
    });

    setPendingUserId(user.id);
    setLastGeneratedCode(confirmationCode);
    setIsLoading(false);
    setStep('confirm');
  };

  const handleConfirmCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUserId) return;

    setIsConfirming(true);
    const ok = aprovarUsuario(pendingUserId, confirmationCodeInput.trim());
    setIsConfirming(false);

    if (ok) {
      router.push('/admin');
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

      {/* Card Principal - Página Independente de Cadastro de Administrador */}
      <div className="login-card" style={{ maxWidth: '500px' }}>
        
        {/* Cabeçalho */}
        <div className="login-header">
          <div className="login-icon-badge">
            <ShieldPlus style={{ width: 34, height: 34 }} />
          </div>
          
          <span className="login-header-sub1">
            LabView UFPI • CSHNB Picos
          </span>
          
          <h1 className="login-header-title">
            {step === 'form' ? 'Cadastrar Administrador / Monitor' : 'Confirmação de Autorização'}
          </h1>
          
          <p className="login-header-sub2">
            {step === 'form' 
              ? 'O cadastro passará pela autorização enviada para luislgl0724@gmail.com'
              : 'Digite o código de 6 dígitos enviado ao e-mail do gestor master'}
          </p>
        </div>

        {/* Corpo do Formulário */}
        <div className="login-body">
          {step === 'form' ? (
            <form onSubmit={handleSubmitRegister} className="login-form">
              
              {/* Nome Completo */}
              <div className="login-field">
                <label className="login-label">
                  Nome Completo *
                </label>
                <div className="login-input-wrap">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Prof. Carlos Eduardo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="login-input"
                    autoFocus
                  />
                  <div className="login-input-icon">
                    <User style={{ width: 18, height: 18 }} />
                  </div>
                </div>
              </div>

              {/* E-mail Institucional */}
              <div className="login-field">
                <label className="login-label">
                  E-mail Institucional (@ufpi.edu.br) *
                </label>
                <div className="login-input-wrap">
                  <input
                    type="email"
                    required
                    placeholder="Ex: carlos.eduardo@ufpi.edu.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="login-input"
                  />
                  <div className="login-input-icon">
                    <Mail style={{ width: 18, height: 18 }} />
                  </div>
                </div>
              </div>

              {/* Senha */}
              <div className="login-field">
                <label className="login-label">
                  Senha de Acesso *
                </label>
                <div className="login-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Defina uma senha segura..."
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="login-input"
                    style={{ paddingRight: 42 }}
                  />
                  <div className="login-input-icon">
                    <KeyRound style={{ width: 18, height: 18 }} />
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

              {/* Perfil de Acesso */}
              <div className="login-field">
                <label className="login-label">
                  Perfil de Acesso *
                </label>
                <select
                  value={perfil}
                  onChange={(e) => setPerfil(e.target.value as UserRole)}
                  className="login-select"
                  style={{ height: '48px' }}
                >
                  <option value="Administrador">Administrador (Gestão total, relatórios e controle)</option>
                  <option value="Monitor">Monitor (Controle de presença e computadores)</option>
                </select>
              </div>

              {/* Box de Confirmação Master */}
              <div style={{
                padding: '12px 14px',
                background: 'rgba(99, 66, 245, 0.08)',
                border: '1.5px solid var(--purple-300)',
                borderRadius: '14px',
                fontSize: '0.78rem',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10
              }}>
                <ShieldAlert style={{ width: 18, height: 18, color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ display: 'block', marginBottom: 2 }}>Confirmação do Gestor Master:</strong>
                  Será enviado um e-mail com código de aprovação para <strong>luislgl0724@gmail.com</strong> para autorizar este cadastro.
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="login-submit-btn">
                <ShieldPlus style={{ width: 20, height: 20 }} />
                <span>{isLoading ? 'Enviando Solicitação...' : 'Enviar Solicitação de Cadastro'}</span>
              </button>
            </form>
          ) : (
            /* ETAPA 2: DIGITAR O CÓDIGO DE CONFIRMAÇÃO */
            <form onSubmit={handleConfirmCodeSubmit} className="login-form">
              <div style={{
                padding: '16px',
                background: 'var(--status-available-bg)',
                border: '1.5px solid var(--status-available-border)',
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--status-available)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>
                  E-mail de Confirmação Despachado
                </span>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', marginTop: 6 }}>
                  Uma notificação de segurança foi enviada para <strong>luislgl0724@gmail.com</strong> contendo o código de ativação.
                </p>
                {lastGeneratedCode && (
                  <div style={{ marginTop: 10, padding: '8px 16px', background: 'var(--bg-card)', borderRadius: '10px', display: 'inline-block', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Código de Validação: </span>
                    <strong style={{ fontSize: '1.05rem', fontFamily: 'var(--font-mono)', color: 'var(--primary)', letterSpacing: '0.14em' }}>
                      {lastGeneratedCode}
                    </strong>
                  </div>
                )}
              </div>

              <div className="login-field" style={{ marginTop: 10 }}>
                <label className="login-label" style={{ textAlign: 'center', display: 'block' }}>
                  Digite o Código de 6 Dígitos Recebido:
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Ex: 849201"
                  value={confirmationCodeInput}
                  onChange={(e) => setConfirmationCodeInput(e.target.value)}
                  className="login-input login-input-mono"
                  style={{ textAlign: 'center', fontSize: '1.3rem', letterSpacing: '0.22em', fontWeight: 900, height: '52px' }}
                  autoFocus
                />
              </div>

              <button type="submit" disabled={isConfirming} className="login-submit-btn">
                <CheckCircle2 style={{ width: 20, height: 20 }} />
                <span>{isConfirming ? 'Validando...' : 'Confirmar e Ativar Administrador'}</span>
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  ← Corrigir dados
                </button>

                <Link
                  href="/admin"
                  style={{
                    color: 'var(--primary)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  Validar mais tarde →
                </Link>
              </div>
            </form>
          )}

          {/* Link para Voltar ao Login de Administrador */}
          <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1.5px solid var(--border-color)', textAlign: 'center' }}>
            <Link
              href="/admin"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary)' }}
              className="hover:underline"
            >
              <ArrowLeft style={{ width: 15, height: 15 }} />
              <span>Voltar para o Painel de Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
