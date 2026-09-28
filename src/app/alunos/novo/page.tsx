'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  UserPlus,
  User,
  Mail,
  GraduationCap,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { useLab } from '@/context/LabContext';
import { StudentStatus } from '@/types';

function AlunoFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const {
    alunos,
    adicionarAluno,
    editarAluno,
    showToast
  } = useLab();

  const isEditing = !!editId;
  const existingAluno = editId ? alunos.find(a => a.id === editId) : null;

  const [matricula, setMatricula] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [curso, setCurso] = useState('Sistemas de Informação');
  const [status, setStatus] = useState<StudentStatus>('ativo');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (existingAluno) {
      setMatricula(existingAluno.id);
      setNome(existingAluno.nome);
      setEmail(existingAluno.email);
      setSenha(existingAluno.senha || '');
      setCurso(existingAluno.curso);
      setStatus(existingAluno.status);
    }
  }, [existingAluno]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricula.trim() || !nome.trim() || !email.trim()) {
      showToast('Preencha os campos obrigatórios.', 'error');
      return;
    }

    setIsLoading(true);

    if (isEditing) {
      editarAluno(matricula.trim(), {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        ...(senha.trim() ? { senha: senha.trim() } : {}),
        curso,
        status
      });
    } else {
      adicionarAluno({
        id: matricula.trim(),
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha: senha.trim() || undefined,
        curso,
        status
      });
    }

    setIsLoading(false);
    router.push('/alunos');
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Header com Botão Voltar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/alunos"
              className="inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para Lista de Alunos</span>
            </Link>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-main)]">
            {isEditing ? `Editar Aluno: ${existingAluno?.nome || matricula}` : 'Cadastrar Novo Aluno'}
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {isEditing
              ? 'Atualize os dados acadêmicos e credenciais de acesso do estudante'
              : 'Cadastre um estudante com matrícula e senha para acesso à sala e computadores'}
          </p>
        </div>
      </div>

      {/* Formulário em Card Dedicado */}
      <div className="card shadow-lg p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Matrícula */}
          <div>
            <label className="text-xs font-bold text-[var(--text-main)] block mb-1.5 uppercase tracking-wider">
              Matrícula Institucional UFPI *
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--primary)]" />
              <input
                type="text"
                required
                disabled={isEditing}
                placeholder="Ex: 2024901234"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[14px] text-xs font-mono font-bold text-[var(--text-main)] focus:border-[var(--border-focus)] outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                autoFocus={!isEditing}
              />
            </div>
          </div>

          {/* Nome Completo */}
          <div>
            <label className="text-xs font-bold text-[var(--text-main)] block mb-1.5 uppercase tracking-wider">
              Nome Completo do Aluno *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                required
                placeholder="Ex: Maria Clara dos Santos"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[14px] text-xs font-medium text-[var(--text-main)] focus:border-[var(--border-focus)] outline-none"
              />
            </div>
          </div>

          {/* E-mail Institucional */}
          <div>
            <label className="text-xs font-bold text-[var(--text-main)] block mb-1.5 uppercase tracking-wider">
              E-mail Institucional (@aluno.ufpi.edu.br) *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="email"
                required
                placeholder="Ex: maria.clara@aluno.ufpi.edu.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[14px] text-xs text-[var(--text-main)] focus:border-[var(--border-focus)] outline-none"
              />
            </div>
          </div>

          {/* Senha de Acesso */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
                Senha de Acesso do Estudante {isEditing ? '(opcional para manter)' : '*'}
              </label>
              <span className="text-[0.7rem] text-[var(--text-muted)]">
                {isEditing ? 'Deixe vazio para manter a atual' : 'Padrão: matrícula do aluno'}
              </span>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--primary)]" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={isEditing ? 'Digite nova senha ou mantenha a atual' : 'Ex: senha123 (ou padrão: matrícula)'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full pl-10 pr-11 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[14px] text-xs font-mono text-[var(--text-main)] focus:border-[var(--border-focus)] outline-none"
              />
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

          {/* Curso e Situação Acadêmica */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--text-main)] block mb-1.5 uppercase tracking-wider">
                Curso de Graduação
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                <select
                  value={curso}
                  onChange={(e) => setCurso(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[14px] text-xs text-[var(--text-main)] font-semibold focus:border-[var(--border-focus)] outline-none"
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
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-main)] block mb-1.5 uppercase tracking-wider">
                Situação Acadêmica
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StudentStatus)}
                className="w-full px-3.5 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[14px] text-xs text-[var(--text-main)] font-semibold focus:border-[var(--border-focus)] outline-none"
              >
                <option value="ativo">Ativo (Acesso Liberado)</option>
                <option value="suspenso">Suspenso (Acesso Bloqueado)</option>
              </select>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)] mt-2">
            <Link
              href="/alunos"
              className="btn btn-secondary text-xs py-2.5 px-5"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary text-xs py-2.5 px-6"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? 'Salvar Alterações' : 'Concluir Cadastro do Aluno'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NovoAlunoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[var(--text-muted)]">Carregando formulário...</div>}>
      <AlunoFormContent />
    </Suspense>
  );
}
