'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, User, Mail, GraduationCap, Shield } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Aluno, StudentStatus } from '@/types';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    id: string;
    nome: string;
    email: string;
    senha?: string;
    curso: string;
    status: StudentStatus;
  }) => void;
  initialData?: Aluno | null;
}

export default function StudentFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData
}: StudentFormModalProps) {
  const isEditing = !!initialData;
  const [matricula, setMatricula] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [curso, setCurso] = useState('Sistemas de Informação');
  const [status, setStatus] = useState<StudentStatus>('ativo');

  useEffect(() => {
    if (initialData) {
      setMatricula(initialData.id);
      setNome(initialData.nome);
      setEmail(initialData.email);
      setSenha(initialData.senha || '');
      setCurso(initialData.curso);
      setStatus(initialData.status);
    } else {
      setMatricula('');
      setNome('');
      setEmail('');
      setSenha('');
      setCurso('Sistemas de Informação');
      setStatus('ativo');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricula.trim() || !nome.trim() || !email.trim()) return;

    onSubmit({
      id: matricula.trim(),
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senha: senha.trim() || undefined,
      curso,
      status
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Aluno' : 'Novo Aluno'}
      subtitle={isEditing ? 'Atualize as informações cadastrais do estudante' : 'Cadastre um novo aluno com matrícula para acesso ao laboratório'}
      icon={<UserPlus className="w-5 h-5" />}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold text-[var(--text-main)] block mb-1">
            Matrícula Institucional *
          </label>
          <input
            type="text"
            required
            disabled={isEditing}
            placeholder="Ex: 2024901234"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[12px] text-xs font-mono font-bold text-[var(--text-main)] focus:border-[var(--border-focus)] outline-none disabled:opacity-60"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[var(--text-main)] block mb-1">
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
              className="w-full pl-9.5 pr-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[12px] text-xs font-medium text-[var(--text-main)] focus:border-[var(--border-focus)] outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[var(--text-main)] block mb-1">
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
              className="w-full pl-9.5 pr-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[12px] text-xs text-[var(--text-main)] focus:border-[var(--border-focus)] outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-[var(--text-main)] block">
              Senha de Acesso do Estudante {isEditing ? '(opcional para manter)' : '*'}
            </label>
            <span className="text-[0.7rem] text-[var(--text-muted)]">
              {isEditing ? 'Deixe em branco para não alterar' : 'Padrão: matrícula do aluno'}
            </span>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder={isEditing ? 'Digite uma nova senha ou mantenha a atual' : 'Ex: senha123 (ou padrão: matrícula)'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[12px] text-xs text-[var(--text-main)] font-mono focus:border-[var(--border-focus)] outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-[var(--text-main)] block mb-1">
              Curso de Graduação
            </label>
            <select
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[12px] text-xs text-[var(--text-main)] font-medium focus:border-[var(--border-focus)] outline-none"
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

          <div>
            <label className="text-xs font-bold text-[var(--text-main)] block mb-1">
              Situação Acadêmica
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StudentStatus)}
              className="w-full px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[12px] text-xs text-[var(--text-main)] font-medium focus:border-[var(--border-focus)] outline-none"
            >
              <option value="ativo">Ativo (Acesso Liberado)</option>
              <option value="suspenso">Suspenso (Acesso Bloqueado)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-[var(--border-color)]">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary text-xs"
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary text-xs">
            <UserPlus className="w-4 h-4" />
            <span>{isEditing ? 'Salvar Alterações' : 'Cadastrar Aluno'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
