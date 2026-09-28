'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  Wrench,
  ShieldCheck,
  Check,
  Clock,
  Calendar,
  User,
  Monitor
} from 'lucide-react';
import { useLab } from '@/context/LabContext';
import IssueModal from '@/components/ocorrencias/IssueModal';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

export default function OcorrenciasPage() {
  const {
    problemas,
    computadores,
    usuarios,
    alunos,
    registrarProblema,
    resolverProblema
  } = useLab();

  const [tab, setTab] = useState<'pendente' | 'resolvido'>('pendente');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const pendentes = problemas.filter(p => p.status === 'pendente');
  const resolvidos = problemas.filter(p => p.status === 'resolvido');
  const currentList = tab === 'pendente' ? pendentes : resolvidos;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-main)]">
            Ocorrências & Chamados de Manutenção
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Registro e histórico técnico de falhas nos computadores e equipamentos do laboratório
          </p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
          <PlusCircle className="w-4 h-4" />
          <span>Abrir Novo Chamado</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2.5">
        <button
          onClick={() => setTab('pendente')}
          className={`btn ${tab === 'pendente' ? 'btn-primary' : 'btn-secondary'} text-xs`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Pendentes ({pendentes.length})</span>
        </button>
        <button
          onClick={() => setTab('resolvido')}
          className={`btn ${tab === 'resolvido' ? 'btn-primary' : 'btn-secondary'} text-xs`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Resolvidos ({resolvidos.length})</span>
        </button>
      </div>

      {/* Issues Table */}
      <div className="card">
        {currentList.length === 0 ? (
          <EmptyState
            title={tab === 'pendente' ? 'Nenhuma ocorrência pendente!' : 'Nenhum chamado resolvido no histórico.'}
            description={tab === 'pendente' ? 'Todos os equipamentos estão operando perfeitamente sem avarias.' : 'Quando os chamados forem solucionados, eles serão arquivados aqui.'}
            icon={tab === 'pendente' ? <ShieldCheck className="w-6 h-6 text-emerald-500" /> : <CheckCircle2 className="w-6 h-6" />}
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Origem / Equipamento</th>
                  <th>Descrição do Defeito</th>
                  <th>Data do Registro</th>
                  <th>Relatado Por</th>
                  <th>Situação</th>
                  <th className="text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {currentList.map(prb => {
                  const pc = prb.computador_id ? computadores.find(c => c.id === prb.computador_id) : null;
                  const isSala = prb.categoria === 'laboratorio' || !prb.computador_id;
                  const operador = usuarios.find(u => u.id === prb.registrado_por);
                  const alunoAutor = alunos.find(a => a.id === prb.registrado_por);
                  const autorTexto = prb.autor_nome || (operador ? operador.nome : alunoAutor ? `${alunoAutor.nome} (Aluno)` : 'Usuário');

                  return (
                    <tr key={prb.id} className="hover:bg-[var(--bg-card-subtle)] transition-colors">
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center font-bold text-xs ${
                            isSala
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                          }`}>
                            {isSala ? '🏛️' : <Monitor className="w-4 h-4" />}
                          </div>
                          <div>
                            <strong className="font-mono text-sm text-[var(--text-main)] block">
                              {isSala ? 'Infraestrutura da Sala' : (pc ? pc.nome_host : `PC #${prb.computador_id}`)}
                            </strong>
                            <span className="text-[0.7rem] text-[var(--text-muted)] font-mono">
                              {isSala ? 'Geral / Laboratório' : (pc ? pc.patrimonio : '')}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="max-w-md">
                        <p className="text-xs font-semibold text-[var(--text-main)] leading-relaxed">
                          {prb.descricao}
                        </p>
                        {prb.data_resolucao && (
                          <span className="text-[0.68rem] text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
                            ✓ Solucionado em {new Date(prb.data_resolucao).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </td>

                      <td className="text-xs text-[var(--text-muted)]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[var(--text-light)]" />
                          <span>{new Date(prb.data_registro).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </td>

                      <td>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-main)]">
                          <User className="w-3 h-3 text-[var(--primary)]" />
                          <span className="font-medium">{autorTexto}</span>
                        </div>
                      </td>

                      <td>
                        {prb.status === 'pendente' ? (
                          <Badge variant="danger" size="sm" pulse>Pendente</Badge>
                        ) : (
                          <Badge variant="success" size="sm">Resolvido</Badge>
                        )}
                      </td>

                      <td className="text-right">
                        {prb.status === 'pendente' ? (
                          <button
                            onClick={() => resolverProblema(prb.id)}
                            className="btn btn-secondary text-xs py-1 px-3 text-[var(--status-available)] border-[var(--status-available-border)] hover:bg-[var(--status-available-bg)]"
                            title="Marcar como Concluído / Resolvido"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Dar Baixa</span>
                          </button>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)] font-semibold">Concluído</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Abertura de Chamado */}
      <IssueModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        computadores={computadores}
        onSubmit={registrarProblema}
      />
    </div>
  );
}
