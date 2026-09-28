'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  Sun,
  Moon,
  Eye,
  EyeOff,
  User,
  KeyRound,
  UserPlus,
  Mail,
  BookOpen,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { useLab } from '@/context/LabContext';

export default function StudentRegisterPage() {
  const router = useRouter();
  const {
    loginAsAluno,
    adicionarAluno,
    theme,
    toggleTheme,
    showToast
  } = useLab();

  // Registration Form States
  const [matricula, setMatricula] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [curso, setCurso] = useState('Sistemas de Informação');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCadastroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricula.trim() || !nome.trim() || !email.trim() || !senha.trim()) {
      showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }

    setIsLoading(true);
    adicionarAluno({
      id: matricula.trim(),
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senha: senha.trim(),
      curso: curso,
      status: 'ativo'
    });

    const ok = loginAsAluno(matricula.trim(), senha.trim());
    setIsLoading(false);

    if (ok) {
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

      {/* Card Principal - Cadastro de Estudante */}
      <div className="login-card" style={{ maxWidth: '480px' }}>
        
        {/* Cabeçalho */}
        <div className="login-header">
          <div className="login-icon-badge">
            <UserPlus style={{ width: 34, height: 34 }} />
          </div>
          
          <span className="login-header-sub1">
            LabView UFPI • CSHNB Picos
          </span>
          
          <h1 className="login-header-title">
            Cadastro de Estudante
          </h1>
          
          <p className="login-header-sub2">
            Crie sua conta para registrar presença e usar os computadores do laboratório
          </p>
        </div>

        {/* Corpo do Formulário */}
        <div className="login-body">
          <form onSubmit={handleCadastroSubmit} className="login-form">
            
            {/* Matrícula */}
            <div className="login-field">
              <label className="login-label">
                Matrícula Institucional UFPI *
              </label>
              <div className="login-input-wrap">
                <input
                  type="text"
                  required
                  placeholder="Ex: 2024901234"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  className="login-input login-input-mono"
                  autoFocus
                />
                <div className="login-input-icon">
                  <GraduationCap style={{ width: 18, height: 18, color: 'var(--primary)' }} />
                </div>
              </div>
            </div>

            {/* Nome Completo */}
            <div className="login-field">
              <label className="login-label">
                Nome Completo do Aluno *
              </label>
              <div className="login-input-wrap">
                <input
                  type="text"
                  required
                  placeholder="Ex: Maria Clara dos Santos"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="login-input"
                />
                <div className="login-input-icon">
                  <User style={{ width: 18, height: 18, color: 'var(--primary)' }} />
                </div>
              </div>
            </div>

            {/* E-mail */}
            <div className="login-field">
              <label className="login-label">
                E-mail Institucional *
              </label>
              <div className="login-input-wrap">
                <input
                  type="email"
                  required
                  placeholder="Ex: maria.clara@aluno.ufpi.edu.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                />
                <div className="login-input-icon">
                  <Mail style={{ width: 18, height: 18, color: 'var(--primary)' }} />
                </div>
              </div>
            </div>

            {/* Curso */}
            <div className="login-field">
              <label className="login-label">
                Curso de Graduação *
              </label>
              <div className="login-input-wrap">
                <select
                  value={curso}
                  onChange={(e) => setCurso(e.target.value)}
                  className="login-select"
                  style={{ height: '48px', paddingLeft: '40px' }}
                >
                  <option value="Sistemas de Informação">Sistemas de Informação</option>
                  <option value="Ciências Biológicas">Ciências Biológicas</option>
                  <option value="Administração">Administração</option>
                  <option value="Enfermagem">Enfermagem</option>
                  <option value="Pedagogia">Pedagogia</option>
                  <option value="Nutrição">Nutrição</option>
                  <option value="Medicina">Medicina</option>
                  <option value="Outro">Outro Curso UFPI</option>
                </select>
                <div className="login-input-icon">
                  <BookOpen style={{ width: 18, height: 18, color: 'var(--primary)' }} />
                </div>
              </div>
            </div>

            {/* Senha */}
            <div className="login-field">
              <label className="login-label">
                Criar Senha de Acesso *
              </label>
              <div className="login-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Crie uma senha de acesso..."
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
              <CheckCircle2 style={{ width: 20, height: 20 }} />
              <span>{isLoading ? 'Cadastrando...' : 'Concluir Cadastro & Entrar'}</span>
            </button>
          </form>

          {/* Link para Voltar ao Login */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1.5px solid var(--border-color)', textAlign: 'center' }}>
            <Link
              href="/"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary)' }}
              className="hover:underline"
            >
              <ArrowLeft style={{ width: 15, height: 15 }} />
              <span>Já possui conta? Ir para o Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
