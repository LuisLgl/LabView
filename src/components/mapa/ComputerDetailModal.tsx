'use client';

import React, { useState } from 'react';
import {
  Monitor,
  User,
  Clock,
  LogOut,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Wrench,
  ChevronRight
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Computador, Aluno, ControleComputadores, ProblemaComputador, AlunoPresente } from '@/types';

interface ComputerDetailModalProps {
  computador: Computador | null;
  isOpen: boolean;
  onClose: () => void;
  sessaoAtiva?: ControleComputadores | null;
  alunoAtual?: Aluno | null;
  tempoUsoMin?: number;
  alunosPresentesSemPc: AlunoPresente[];
  problemasDoPc: ProblemaComputador[];
  onAlocarAluno: (alunoId: string, computadorId: number) => void;
  onEncerrarSessao: (pcId: number) => void;
  onAbrirChamado: (pcId: number, descricao: string) => void;
  onResolverChamado: (problemaId: string) => void;
}

export default function ComputerDetailModal({
  computador,
  isOpen,
  onClose,
  sessaoAtiva,
  alunoAtual,
  tempoUsoMin = 0,
  alunosPresentesSemPc,
  problemasDoPc,
  onAlocarAluno,
  onEncerrarSessao,
  onAbrirChamado,
  onResolverChamado
}: ComputerDetailModalProps) {
  const [selectedMatricula, setSelectedMatricula] = useState('');
  const [manualMatricula, setManualMatricula] = useState('');
  const [novaDescricaoDefeito, setNovaDescricaoDefeito] = useState('');
  const [showAddIssueForm, setShowAddIssueForm] = useState(false);

  if (!computador) return null;

  const handleAlocar = (e: React.FormEvent) => {
    e.preventDefault();
    const matriculaFinal = selectedMatricula || manualMatricula.trim();
    if (!matriculaFinal) return;
    onAlocarAluno(matriculaFinal, computador.id);
    setSelectedMatricula('');
    setManualMatricula('');
    onClose();
  };

  const handleSalvarDefeito = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaDescricaoDefeito.trim()) return;
    onAbrirChamado(computador.id, novaDescricaoDefeito.trim());
    setNovaDescricaoDefeito('');
    setShowAddIssueForm(false);
  };

  const formatUso = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutos`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h} hora(s) e ${m} minuto(s)`;
  };

  const statusColors = {
    disponivel: 'badge-disp',
    ocupado: 'badge-ocup',
    manutencao: 'badge-manu'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${computador.nome_host} • ${computador.patrimonio}`}
      subtitle="Gerenciamento de Máquina e Controle de Sessão"
      icon={<Monitor className="w-5 h-5" />}
      maxWidth="lg"
    >
      <div className="flex flex-col gap-5">
        {/* Status bar */}
        <div className="flex items-center justify-between p-3.5 bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-[14px]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Status Atual:</span>
            <span className={`badge-tag ${statusColors[computador.status]} text-xs uppercase font-extrabold`}>
              {computador.status}
            </span>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            ID Interno #{computador.id}
          </span>
        </div>

        {/* Especificações Técnicas */}
        <div className="p-3.5 bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-[14px]">
          <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase flex items-center gap-1.5 mb-1.5">
            <Cpu className="w-3.5 h-3.5 text-[var(--primary)]" />
            Especificações de Hardware / SO
          </h4>
          <p className="text-xs text-[var(--text-main)] font-mono">
            {computador.especificacoes || 'Intel Core i7, 16GB RAM, SSD 512GB NVMe, Linux Ubuntu / Windows 11'}
          </p>
        </div>

        {/* Se estiver ocupado: Aluno Atual */}
        {computador.status === 'ocupado' && alunoAtual && (
          <div className="p-4 bg-[var(--purple-50)] dark:bg-[var(--purple-950)]/40 border border-[var(--purple-200)] dark:border-[var(--purple-800)] rounded-[14px]">
            <h4 className="text-xs font-bold text-[var(--purple-700)] dark:text-[var(--purple-300)] uppercase flex items-center gap-1.5 mb-2.5">
              <User className="w-4 h-4" />
              Sessão de Uso Ativa
            </h4>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <strong className="text-sm text-[var(--text-main)] block">{alunoAtual.nome}</strong>
                <span className="text-xs text-[var(--text-muted)]">
                  Matrícula: <strong className="text-[var(--text-main)] font-mono">{alunoAtual.id}</strong> • Curso: {alunoAtual.curso}
                </span>
                <div className="text-xs text-[var(--primary)] font-semibold mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Em utilização há {formatUso(tempoUsoMin)}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  onEncerrarSessao(computador.id);
                  onClose();
                }}
                className="btn btn-secondary text-xs text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Desocupar Computador</span>
              </button>
            </div>
          </div>
        )}

        {/* Se estiver disponível: Alocar aluno */}
        {computador.status === 'disponivel' && (
          <div className="p-4 bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-[14px]">
            <h4 className="text-xs font-bold text-[var(--text-main)] uppercase flex items-center gap-1.5 mb-3">
              <UserCheck className="w-4 h-4 text-[var(--status-available)]" />
              Alocar Aluno Neste Computador
            </h4>
            
            <form onSubmit={handleAlocar} className="flex flex-col gap-3">
              {alunosPresentesSemPc.length > 0 ? (
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                    Selecionar Aluno Presente na Sala ({alunosPresentesSemPc.length} sem máquina):
                  </label>
                  <select
                    value={selectedMatricula}
                    onChange={(e) => {
                      setSelectedMatricula(e.target.value);
                      setManualMatricula('');
                    }}
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[12px] text-xs text-[var(--text-main)] font-medium focus:border-[var(--border-focus)] outline-none"
                  >
                    <option value="">-- Escolha um aluno presente --</option>
                    {alunosPresentesSemPc.map(p => (
                      <option key={p.id} value={p.aluno_id}>
                        {p.aluno?.nome} (Matrícula: {p.aluno_id}) - {p.aluno?.curso}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-input)] p-2.5 rounded-[10px] border border-[var(--border-subtle)]">
                  Nenhum aluno desocupado na sala no momento. Você pode digitar a matrícula diretamente abaixo:
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                  Ou Digite a Matrícula do Aluno:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: 2024901234"
                    value={manualMatricula}
                    onChange={(e) => {
                      setManualMatricula(e.target.value);
                      setSelectedMatricula('');
                    }}
                    className="flex-1 px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[12px] text-xs font-mono text-[var(--text-main)] focus:border-[var(--border-focus)] outline-none"
                  />
                  <button type="submit" className="btn btn-primary text-xs">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Iniciar Uso</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Ocorrências e Chamados desta Máquina */}
        <div className="p-4 bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-[14px]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-[var(--text-main)] uppercase flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-[var(--status-maintenance)]" />
              Histórico de Manutenções & Defeitos ({problemasDoPc.length})
            </h4>
            <button
              onClick={() => setShowAddIssueForm(!showAddIssueForm)}
              className="text-xs font-bold text-[var(--primary)] hover:underline"
            >
              {showAddIssueForm ? 'Cancelar' : '+ Abrir Ocorrência'}
            </button>
          </div>

          {showAddIssueForm && (
            <form onSubmit={handleSalvarDefeito} className="mb-4 p-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[12px] flex flex-col gap-2.5 animate-fade-in">
              <label className="text-xs font-semibold text-[var(--text-muted)]">
                Descrição do Problema / Falha:
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Teclado falhando teclas W/S, monitor piscando ou sem sinal..."
                value={novaDescricaoDefeito}
                onChange={(e) => setNovaDescricaoDefeito(e.target.value)}
                className="w-full p-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[10px] text-xs text-[var(--text-main)] focus:border-[var(--border-focus)] outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddIssueForm(false)}
                  className="btn btn-secondary text-xs py-1.5"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary text-xs py-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Registrar Chamado</span>
                </button>
              </div>
            </form>
          )}

          {problemasDoPc.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">
              Nenhuma falha técnica registrada para esta máquina.
            </p>
          ) : (
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
              {problemasDoPc.map(prob => (
                <div
                  key={prob.id}
                  className="flex items-center justify-between p-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[10px] text-xs"
                >
                  <div>
                    <strong className="text-[var(--text-main)] block">{prob.descricao}</strong>
                    <span className="text-[0.7rem] text-[var(--text-muted)]">
                      Registrado em {new Date(prob.data_registro).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {prob.status === 'pendente' ? (
                    <button
                      onClick={() => onResolverChamado(prob.id)}
                      className="btn btn-secondary text-xs py-1 px-2.5 text-[var(--status-available)] border-[var(--status-available-border)] hover:bg-[var(--status-available-bg)]"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Resolver</span>
                    </button>
                  ) : (
                    <span className="badge-tag bg-emerald-100 text-emerald-800 text-[0.65rem]">
                      Resolvido
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
