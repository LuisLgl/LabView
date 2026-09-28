'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Monitor,
  CheckCircle2,
  Wrench,
  Grid,
  UserPlus,
  ArrowRight,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { useLab } from '@/context/LabContext';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

export default function DashboardPage() {
  const {
    computadores,
    getAlunosPresentes,
    problemas,
    alunos
  } = useLab();

  const presentes = getAlunosPresentes();
  const totalPcs = computadores.length;
  const ocupados = computadores.filter(c => c.status === 'ocupado').length;
  const disponiveis = computadores.filter(c => c.status === 'disponivel').length;
  const manutencoes = computadores.filter(c => c.status === 'manutencao').length;
  const taxaOcupacao = totalPcs > 0 ? Math.round((ocupados / totalPcs) * 100) : 0;
  const problemasPendentes = problemas.filter(p => p.status === 'pendente').length;

  return (
    <div className="flex flex-col gap-7">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-main)] flex items-center gap-2">
            Painel Geral de Monitoramento
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" title="Monitoramento ao vivo" />
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Visão em tempo real da ocupação, fluxo de alunos e integridade dos equipamentos • UFPI CSHNB
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href="/portal-aluno" className="btn btn-secondary text-xs">
            <GraduationCap className="w-4 h-4" />
            <span>Portal do Aluno</span>
          </Link>
          <Link href="/mapa" className="btn btn-secondary text-xs">
            <Grid className="w-4 h-4" />
            <span>Mapa da Sala</span>
          </Link>
          <Link href="/acesso" className="btn btn-primary text-xs">
            <UserPlus className="w-4 h-4" />
            <span>Portaria</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Alunos na Sala"
          value={presentes.length}
          icon={<Users className="w-6 h-6" />}
          subtext={
            <span className="text-[var(--status-available)] font-semibold flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {presentes.filter(p => p.computadorEmUso).length} utilizando PCs
            </span>
          }
        />

        <StatCard
          title="Computadores em Uso"
          value={`${ocupados} / ${totalPcs}`}
          icon={<Monitor className="w-6 h-6" />}
          iconBgColor="bg-purple-100 dark:bg-purple-950/50"
          iconColor="text-[var(--primary)]"
          subtext={<span className="text-[var(--text-muted)]">Taxa de ocupação: <strong>{taxaOcupacao}%</strong></span>}
        />

        <StatCard
          title="PCs Disponíveis"
          value={disponiveis}
          icon={<CheckCircle2 className="w-6 h-6" />}
          iconBgColor="bg-[var(--status-available-bg)]"
          iconColor="text-[var(--status-available)]"
          valueColor="text-[var(--status-available)]"
          subtext={<span className="text-[var(--status-available)]">Prontos para uso imediato</span>}
        />

        <StatCard
          title="Manutenção / Falhas"
          value={manutencoes}
          icon={<Wrench className="w-6 h-6" />}
          iconBgColor={manutencoes > 0 ? 'bg-[var(--status-maintenance-bg)]' : 'bg-amber-50 dark:bg-amber-950/40'}
          iconColor={manutencoes > 0 ? 'text-[var(--status-maintenance)]' : 'text-amber-500'}
          valueColor={manutencoes > 0 ? 'text-[var(--status-maintenance)]' : 'text-[var(--text-main)]'}
          subtext={
            <span className={manutencoes > 0 ? 'text-[var(--status-maintenance)]' : 'text-amber-500'}>
              {problemasPendentes} chamados pendentes
            </span>
          }
        />
      </div>

      {/* Main Grid: Status visualizer & Presentes ao vivo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status Distribution Progress */}
        <div className="card lg:col-span-2 flex flex-col justify-between">
          <div className="card-header">
            <h3 className="font-bold text-lg text-[var(--text-main)] flex items-center gap-2">
              <Monitor className="w-5 h-5 text-[var(--primary)]" />
              Distribuição do Parque de Máquinas
            </h3>
            <Badge variant="purple">{totalPcs} Computadores</Badge>
          </div>

          <div className="flex flex-col gap-6 py-2">
            {totalPcs === 0 ? (
              <EmptyState
                title="Nenhum computador cadastrado"
                description="Cadastre os computadores do laboratório no menu 'Computadores' para começar a monitorar."
                action={
                  <Link href="/computadores" className="btn btn-primary text-xs">
                    Cadastrar Primeiro Computador
                  </Link>
                }
              />
            ) : (
              <>
                {/* Visual Bar */}
                <div className="h-5 w-full bg-[var(--border-color)] rounded-full overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: `${(disponiveis / (totalPcs || 1)) * 100}%` }}
                    className="bg-[var(--status-available)] transition-all duration-500 hover:opacity-90"
                    title={`Disponíveis: ${disponiveis}`}
                  />
                  <div
                    style={{ width: `${(ocupados / (totalPcs || 1)) * 100}%` }}
                    className="bg-[var(--purple-600)] transition-all duration-500 hover:opacity-90"
                    title={`Ocupados: ${ocupados}`}
                  />
                  <div
                    style={{ width: `${(manutencoes / (totalPcs || 1)) * 100}%` }}
                    className="bg-[var(--status-maintenance)] transition-all duration-500 hover:opacity-90"
                    title={`Manutenção: ${manutencoes}`}
                  />
                </div>

                {/* Legend Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3.5 bg-[var(--bg-card-subtle)] rounded-[14px] border border-[var(--border-color)]">
                    <div className="w-3 h-3 rounded-full bg-[var(--status-available)] mx-auto mb-1.5" />
                    <div className="text-xl font-extrabold text-[var(--status-available)]">{disponiveis}</div>
                    <div className="text-xs text-[var(--text-muted)] font-semibold">Disponíveis</div>
                  </div>
                  <div className="p-3.5 bg-[var(--bg-card-subtle)] rounded-[14px] border border-[var(--border-color)]">
                    <div className="w-3 h-3 rounded-full bg-[var(--purple-600)] mx-auto mb-1.5" />
                    <div className="text-xl font-extrabold text-[var(--purple-600)]">{ocupados}</div>
                    <div className="text-xs text-[var(--text-muted)] font-semibold">Em Uso / Ocupados</div>
                  </div>
                  <div className="p-3.5 bg-[var(--bg-card-subtle)] rounded-[14px] border border-[var(--border-color)]">
                    <div className="w-3 h-3 rounded-full bg-[var(--status-maintenance)] mx-auto mb-1.5" />
                    <div className="text-xl font-extrabold text-[var(--status-maintenance)]">{manutencoes}</div>
                    <div className="text-xs text-[var(--text-muted)] font-semibold">Em Manutenção</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Live Attendance */}
        <div className="card flex flex-col">
          <div className="card-header">
            <h3 className="font-bold text-lg text-[var(--text-main)] flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--status-available)]" />
              Alunos Presentes Agora
            </h3>
            <Link href="/acesso" className="text-xs font-bold text-[var(--primary)] hover:underline">
              Ver Portaria
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[280px] flex flex-col gap-2.5 pr-1">
            {presentes.length === 0 ? (
              <EmptyState
                title="Nenhum aluno na sala"
                description="Os alunos que passarem pela portaria ou totem aparecerão aqui."
              />
            ) : (
              presentes.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-[var(--bg-card-subtle)] rounded-[14px] border border-[var(--border-color)] hover:border-[var(--border-focus)] transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center font-bold text-xs shrink-0">
                      {p.aluno?.nome.charAt(0) || '?'}
                    </div>
                    <div className="truncate max-w-[140px]">
                      <strong className="text-xs text-[var(--text-main)] block truncate">
                        {p.aluno?.nome || p.aluno_id}
                      </strong>
                      <span className="text-[0.7rem] text-[var(--text-muted)] truncate block">
                        {p.aluno?.curso}
                      </span>
                    </div>
                  </div>
                  <div>
                    {p.computadorEmUso ? (
                      <span className="badge-tag badge-ocup text-xs font-mono">
                        {p.computadorEmUso.nome_host}
                      </span>
                    ) : (
                      <span className="badge-tag bg-[var(--border-subtle)] text-[var(--text-muted)] text-xs">
                        Sem PC
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Quick Benches Grid Preview */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-bold text-lg text-[var(--text-main)] flex items-center gap-2">
            <Grid className="w-5 h-5 text-[var(--primary)]" />
            Visão Rápida dos Computadores do Laboratório
          </h3>
          <Link href="/mapa" className="btn btn-secondary text-xs">
            <span>Abrir Mapa Interativo Completo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {computadores.length === 0 ? (
          <EmptyState
            title="Inventário de computadores vazio"
            description="Cadastre os computadores para visualizar a grade das máquinas."
            action={
              <Link href="/computadores" className="btn btn-primary text-xs">
                Cadastrar Computador
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {computadores.map(pc => (
              <Link
                key={pc.id}
                href="/mapa"
                className={`p-3.5 rounded-[14px] border-2 flex flex-col items-center text-center transition-all hover:scale-105 no-underline cursor-pointer ${
                  pc.status === 'disponivel'
                    ? 'border-[var(--status-available-border)] bg-[var(--bg-card)]'
                    : pc.status === 'ocupado'
                    ? 'border-[var(--status-occupied-border)] bg-[var(--bg-card)]'
                    : 'border-[var(--status-maintenance-border)] bg-[var(--status-maintenance-bg)]'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-[10px] flex items-center justify-center mb-2 ${
                    pc.status === 'disponivel'
                      ? 'bg-[var(--status-available-bg)] text-[var(--status-available)]'
                      : pc.status === 'ocupado'
                      ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                      : 'bg-white text-[var(--status-maintenance)] shadow-sm'
                  }`}
                >
                  <Monitor className="w-5 h-5" />
                </div>
                <strong className="font-mono text-xs text-[var(--text-main)]">{pc.nome_host}</strong>
                <span
                  className={`text-[0.68rem] font-bold px-2 py-0.5 rounded-full mt-1.5 uppercase ${
                    pc.status === 'disponivel'
                      ? 'badge-disp'
                      : pc.status === 'ocupado'
                      ? 'badge-ocup'
                      : 'badge-manu'
                  }`}
                >
                  {pc.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
