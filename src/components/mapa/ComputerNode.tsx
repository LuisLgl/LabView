'use client';

import React from 'react';
import { Monitor, User, Clock, AlertTriangle } from 'lucide-react';
import { Computador, Aluno, ControleComputadores } from '@/types';

interface ComputerNodeProps {
  computador: Computador;
  sessaoAtiva?: ControleComputadores | null;
  alunoAtual?: Aluno | null;
  tempoUsoMin?: number;
  hasPendingIssue?: boolean;
  onClick: () => void;
}

export default function ComputerNode({
  computador,
  sessaoAtiva,
  alunoAtual,
  tempoUsoMin = 0,
  hasPendingIssue = false,
  onClick
}: ComputerNodeProps) {
  const isAvailable = computador.status === 'disponivel';
  const isOccupied = computador.status === 'ocupado';
  const isMaintenance = computador.status === 'manutencao';

  const formatUso = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <button
      onClick={onClick}
      className={`relative group p-3.5 rounded-[16px] border-2 transition-all duration-200 text-left flex flex-col justify-between min-h-[140px] cursor-pointer hover:shadow-lg hover:-translate-y-1 ${
        isAvailable
          ? 'border-[var(--status-available-border)] bg-[var(--bg-card)] hover:border-[var(--status-available)]'
          : isOccupied
          ? 'border-[var(--status-occupied-border)] bg-[var(--bg-card)] hover:border-[var(--primary)]'
          : 'border-[var(--status-maintenance-border)] bg-[var(--status-maintenance-bg)] hover:border-[var(--status-maintenance)]'
      }`}
    >
      {/* Top Header inside card */}
      <div className="flex items-center justify-between w-full">
        <div
          className={`w-9 h-9 rounded-[10px] flex items-center justify-center font-bold transition-transform group-hover:scale-105 ${
            isAvailable
              ? 'bg-[var(--status-available-bg)] text-[var(--status-available)]'
              : isOccupied
              ? 'bg-[var(--primary-light)] text-[var(--primary)]'
              : 'bg-white text-[var(--status-maintenance)] shadow-sm'
          }`}
        >
          <Monitor className="w-5 h-5" />
        </div>

        <div className="flex items-center gap-1">
          {hasPendingIssue && (
            <span
              title="Possui chamado aberto de manutenção"
              className="p-1 rounded-full bg-[var(--status-maintenance-bg)] text-[var(--status-maintenance)]"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          )}
          <span
            className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              isAvailable
                ? 'badge-disp'
                : isOccupied
                ? 'badge-ocup'
                : 'badge-manu'
            }`}
          >
            {computador.status}
          </span>
        </div>
      </div>

      {/* Center Host Info */}
      <div className="my-2">
        <strong className="font-mono text-sm font-extrabold text-[var(--text-main)] block">
          {computador.nome_host}
        </strong>
        <span className="text-[0.7rem] text-[var(--text-light)] font-mono">
          {computador.patrimonio}
        </span>
      </div>

      {/* Bottom User or Status Details */}
      <div className="w-full pt-2 border-t border-[var(--border-subtle)] text-[0.72rem]">
        {isOccupied && alunoAtual ? (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1 font-semibold text-[var(--primary)] truncate">
              <User className="w-3 h-3 shrink-0" />
              <span className="truncate">{alunoAtual.nome.split(' ')[0]} {alunoAtual.nome.split(' ')[1] || ''}</span>
            </div>
            <div className="flex items-center gap-1 text-[var(--text-muted)] text-[0.68rem]">
              <Clock className="w-2.5 h-2.5" />
              <span>Em uso há {formatUso(tempoUsoMin)}</span>
            </div>
          </div>
        ) : isAvailable ? (
          <span className="text-[var(--status-available)] font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-available)] animate-pulse" />
            Livre para alocação
          </span>
        ) : (
          <span className="text-[var(--status-maintenance)] font-semibold truncate block">
            Em manutenção técnica
          </span>
        )}
      </div>
    </button>
  );
}
