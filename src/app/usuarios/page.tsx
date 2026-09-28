'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldPlus,
  Shield,
  UserCheck,
  Mail,
  User,
  CheckCircle2,
  Lock,
  Trash2,
  Clock,
  ShieldAlert,
  KeyRound,
  Check,
  X
} from 'lucide-react';
import { useLab } from '@/context/LabContext';
import { UserRole, Usuario } from '@/types';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';

export default function UsuariosPage() {
  const {
    usuarios,
    currentUser,
    setCurrentUser,
    solicitarCadastroUsuario,
    aprovarUsuario,
    removerUsuario,
    showToast
  } = useLab();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState<UserRole>('Administrador');

  // Confirmation Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedPendingUser, setSelectedPendingUser] = useState<Usuario | null>(null);
  const [codigoInput, setCodigoInput] = useState('');

  const usuariosAprovados = usuarios.filter(u => u.status_aprovacao !== 'pendente');
  const usuariosPendentes = usuarios.filter(u => u.status_aprovacao === 'pendente');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) return;

    solicitarCadastroUsuario({
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senha: senha.trim() || 'admin',
      perfil
    });

    setNome('');
    setEmail('');
    setSenha('');
    setPerfil('Administrador');
    setIsAddModalOpen(false);
  };

  const handleAprovarDireto = (user: Usuario) => {
    aprovarUsuario(user.id);
  };

  const handleAprovarComCodigo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPendingUser) return;
    const ok = aprovarUsuario(selectedPendingUser.id, codigoInput.trim());
    if (ok) {
      setIsConfirmModalOpen(false);
      setCodigoInput('');
      setSelectedPendingUser(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-main)]">
            Responsáveis & Administradores do Sistema
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Gerenciamento de contas de professores, coordenadores e monitores do laboratório com autorização por e-mail
          </p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
          <ShieldPlus className="w-4 h-4" />
          <span>Cadastrar Novo Administrador</span>
        </button>
      </div>

      {/* Current Logged Operator Card */}
      <div className="card bg-gradient-to-r from-[var(--purple-900)] to-[var(--purple-700)] text-white border-0 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[16px] bg-white/15 border-2 border-white/30 text-white font-extrabold text-xl flex items-center justify-center shadow-inner">
              {currentUser?.nome.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-purple-200 font-bold">
                  Operador Ativo no Momento:
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[0.65rem] font-bold uppercase">
                  {currentUser?.perfil}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white mt-0.5">{currentUser?.nome}</h3>
              <span className="text-xs text-purple-200">{currentUser?.email}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-purple-200 block">Todas as alterações de inventário e sala serão assinadas por este usuário.</span>
          </div>
        </div>
      </div>

      {/* Solicitações Pendentes de Confirmação (luislgl0724@gmail.com) */}
      {usuariosPendentes.length > 0 && (
        <div className="card" style={{ borderColor: 'var(--purple-400)', background: 'rgba(99, 66, 245, 0.04)' }}>
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--primary)]" />
              <div>
                <h3 className="font-bold text-base text-[var(--text-main)]">
                  Solicitações Pendentes de Confirmação ({usuariosPendentes.length})
                </h3>
                <span className="text-xs text-[var(--text-muted)]">
                  Aprovações despachadas para o e-mail master: <strong className="text-[var(--primary)]">luislgl0724@gmail.com</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome do Solicitante</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Código de Confirmação</th>
                  <th className="text-right">Aprovação do Gestor</th>
                </tr>
              </thead>
              <tbody>
                {usuariosPendentes.map(u => (
                  <tr key={u.id} className="hover:bg-[var(--bg-card-subtle)]">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 font-bold text-xs flex items-center justify-center">
                          {u.nome.charAt(0)}
                        </div>
                        <div>
                          <strong className="text-sm text-[var(--text-main)] block">{u.nome}</strong>
                          <span className="text-[0.68rem] text-[var(--text-muted)]">Pendente de confirmação</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs text-[var(--text-muted)]">{u.email}</td>
                    <td>
                      <Badge variant="neutral" size="sm">{u.perfil}</Badge>
                    </td>
                    <td>
                      <span className="font-mono text-xs font-extrabold text-[var(--primary)] bg-[var(--primary-light)] px-2.5 py-1 rounded-[8px] border border-[var(--purple-300)]">
                        {u.codigo_confirmacao || 'Enviado por e-mail'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAprovarDireto(u)}
                          className="btn btn-primary text-xs py-1 px-3"
                          title="Aprovar e ativar agora"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Aprovar Cadastro</span>
                        </button>
                        <button
                          onClick={() => removerUsuario(u.id)}
                          className="btn btn-secondary text-xs py-1 px-2 text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Recusar cadastro"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table of all active operators */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-bold text-lg text-[var(--text-main)] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--primary)]" />
            Operadores Aprovados & Ativos ({usuariosAprovados.length})
          </h3>
          <span className="text-xs text-[var(--text-muted)]">
            Professores e administradores autorizados a gerenciar o laboratório
          </span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome do Operador</th>
                <th>E-mail Institucional</th>
                <th>Perfil de Acesso</th>
                <th>Data de Cadastro</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuariosAprovados.map(u => {
                const isSelected = currentUser?.id === u.id;
                return (
                  <tr key={u.id} className="hover:bg-[var(--bg-card-subtle)] transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 ${
                            u.perfil === 'Administrador'
                              ? 'bg-gradient-to-br from-[var(--purple-700)] to-[var(--purple-900)]'
                              : 'bg-gradient-to-br from-[var(--purple-500)] to-[var(--purple-700)]'
                          }`}
                        >
                          {u.nome.charAt(0)}
                        </div>
                        <div>
                          <strong className="text-sm text-[var(--text-main)] block">{u.nome}</strong>
                          <span className="text-[0.68rem] text-[var(--text-muted)] font-mono">ID: {u.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="text-xs text-[var(--text-muted)]">{u.email}</td>

                    <td>
                      <Badge variant={u.perfil === 'Administrador' ? 'purple' : 'neutral'}>
                        {u.perfil === 'Administrador' ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                        <span>{u.perfil}</span>
                      </Badge>
                    </td>

                    <td className="text-xs text-[var(--text-muted)]">
                      {new Date(u.criado_em).toLocaleDateString('pt-BR')}
                    </td>

                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[var(--status-available)] bg-[var(--status-available-bg)] px-3 py-1.5 rounded-full border border-[var(--status-available-border)]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Ativo Agora</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setCurrentUser(u.id);
                              showToast(`Sessão alternada para ${u.nome}!`, 'success');
                            }}
                            className="btn btn-secondary text-xs py-1 px-3"
                          >
                            <span>Alternar</span>
                          </button>
                        )}
                        {u.id !== 'usr-01' && (
                          <button
                            onClick={() => removerUsuario(u.id)}
                            className="btn-icon p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                            title="Remover operador"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro de Operador */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Novo Administrador / Monitor"
        subtitle="O cadastro precisará da confirmação enviada para luislgl0724@gmail.com"
        icon={<ShieldPlus className="w-5 h-5" />}
      >
        <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-[var(--text-main)] block mb-1">
              Nome Completo *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                required
                placeholder="Ex: Prof. Carlos Eduardo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full pl-9.5 pr-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[12px] text-xs font-medium text-[var(--text-main)] focus:border-[var(--border-focus)] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-main)] block mb-1">
              E-mail Institucional (@ufpi.edu.br) *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="email"
                required
                placeholder="Ex: carlos.eduardo@ufpi.edu.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9.5 pr-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[12px] text-xs font-medium text-[var(--text-main)] focus:border-[var(--border-focus)] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-main)] block mb-1">
              Senha de Acesso *
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="password"
                required
                placeholder="Defina a senha de acesso..."
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full pl-9.5 pr-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[12px] text-xs font-medium text-[var(--text-main)] focus:border-[var(--border-focus)] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-main)] block mb-1">
              Perfil de Acesso
            </label>
            <select
              value={perfil}
              onChange={(e) => setPerfil(e.target.value as UserRole)}
              className="w-full px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[12px] text-xs text-[var(--text-main)] font-semibold focus:border-[var(--border-focus)] outline-none"
            >
              <option value="Administrador">Administrador (Acesso total, relatórios e gestão)</option>
              <option value="Monitor">Monitor (Controle de sala e computadores)</option>
            </select>
          </div>

          <div className="p-3 bg-purple-500/10 border border-purple-300 rounded-[12px] text-xs text-[var(--text-main)] flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
            <div>
              <strong>Confirmação de Segurança:</strong>
              <p className="mt-0.5 text-[0.72rem] text-[var(--text-muted)]">
                Ao cadastrar, uma autorização com código será enviada para <strong>luislgl0724@gmail.com</strong> para validar o novo operador.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="btn btn-secondary text-xs"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary text-xs">
              <ShieldPlus className="w-4 h-4" />
              <span>Solicitar Cadastro</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
