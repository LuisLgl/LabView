'use client';

import React, { useState } from 'react';
import {
  Monitor,
  PlusCircle,
  Edit3,
  AlertTriangle,
  Trash2,
  User,
  Cpu,
  Clock
} from 'lucide-react';
import { useLab } from '@/context/LabContext';
import { Computador, ComputerStatus } from '@/types';
import AddComputerModal from '@/components/mapa/AddComputerModal';
import IssueModal from '@/components/ocorrencias/IssueModal';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import SearchInput from '@/components/ui/SearchInput';
import EmptyState from '@/components/ui/EmptyState';

export default function ComputadoresPage() {
  const {
    computadores,
    controleComputadores,
    alunos,
    adicionarComputador,
    editarComputador,
    removerComputador,
    registrarProblema
  } = useLab();

  const [filter, setFilter] = useState<'all' | ComputerStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPc, setEditingPc] = useState<Computador | null>(null);
  const [reportingPcId, setReportingPcId] = useState<number | null>(null);

  const filteredComputers = computadores.filter(c => {
    const matchesSearch = c.nome_host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patrimonio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPc) return;
    editarComputador(editingPc.id, {
      nome_host: editingPc.nome_host,
      patrimonio: editingPc.patrimonio,
      status: editingPc.status,
      especificacoes: editingPc.especificacoes
    });
    setEditingPc(null);
  };

  const getStatusBadge = (status: ComputerStatus) => {
    switch (status) {
      case 'disponivel':
        return <Badge variant="success">Disponível</Badge>;
      case 'ocupado':
        return <Badge variant="purple">Em Uso</Badge>;
      case 'manutencao':
        return <Badge variant="danger">Manutenção</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-main)]">
            Inventário & Gestão de Computadores
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Controle patrimonial, configurações técnicas e status de utilização das máquinas
          </p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
          <PlusCircle className="w-4 h-4" />
          <span>Cadastrar Computador</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] shadow-sm">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`btn text-xs py-1.5 px-3 ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Todos ({computadores.length})
          </button>
          <button
            onClick={() => setFilter('disponivel')}
            className={`btn text-xs py-1.5 px-3 ${filter === 'disponivel' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Disponíveis ({computadores.filter(c => c.status === 'disponivel').length})
          </button>
          <button
            onClick={() => setFilter('ocupado')}
            className={`btn text-xs py-1.5 px-3 ${filter === 'ocupado' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Em Uso ({computadores.filter(c => c.status === 'ocupado').length})
          </button>
          <button
            onClick={() => setFilter('manutencao')}
            className={`btn text-xs py-1.5 px-3 ${filter === 'manutencao' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Manutenção ({computadores.filter(c => c.status === 'manutencao').length})
          </button>
        </div>

        <div className="w-full sm:w-72">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por host ou patrimônio..."
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="card">
        {filteredComputers.length === 0 ? (
          <EmptyState
            title="Nenhum computador encontrado"
            description="Nenhuma máquina corresponde aos critérios de filtro aplicados."
            action={
              <button
                onClick={() => {
                  setFilter('all');
                  setSearchQuery('');
                }}
                className="btn btn-secondary text-xs"
              >
                Limpar Filtros
              </button>
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Computador / Host</th>
                  <th>Tombamento (Patrimônio)</th>
                  <th>Configuração / Hardware</th>
                  <th>Status Operacional</th>
                  <th>Usuário Atual</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredComputers.map(pc => {
                  const sessaoAtiva = controleComputadores.find(s => s.computador_id === pc.id && !s.fim_uso);
                  const alunoAtual = sessaoAtiva ? alunos.find(a => a.id === sessaoAtiva.aluno_id) : null;

                  return (
                    <tr key={pc.id} className="hover:bg-[var(--bg-card-subtle)] transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-[10px] flex items-center justify-center font-bold ${
                              pc.status === 'disponivel'
                                ? 'bg-[var(--status-available-bg)] text-[var(--status-available)]'
                                : pc.status === 'ocupado'
                                ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                                : 'bg-[var(--status-maintenance-bg)] text-[var(--status-maintenance)]'
                            }`}
                          >
                            <Monitor className="w-5 h-5" />
                          </div>
                          <div>
                            <strong className="font-mono text-sm text-[var(--text-main)] block">{pc.nome_host}</strong>
                            <span className="text-[0.7rem] text-[var(--text-muted)] font-mono">ID: #{pc.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="font-mono text-xs font-bold text-[var(--text-main)] bg-[var(--bg-input)] px-2.5 py-1 rounded-[8px] border border-[var(--border-color)]">
                          {pc.patrimonio}
                        </span>
                      </td>

                      <td className="text-xs text-[var(--text-muted)] max-w-xs truncate" title={pc.especificacoes || ''}>
                        {pc.especificacoes || 'Intel Core i7, 16GB RAM, SSD 512GB NVMe'}
                      </td>

                      <td>{getStatusBadge(pc.status)}</td>

                      <td>
                        {pc.status === 'ocupado' && alunoAtual ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center text-xs font-bold shrink-0">
                              {alunoAtual.nome.charAt(0)}
                            </div>
                            <div>
                              <strong className="text-xs text-[var(--text-main)] block">{alunoAtual.nome}</strong>
                              <span className="text-[0.68rem] text-[var(--text-muted)] font-mono">{alunoAtual.id}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--text-light)]">Nenhum</span>
                        )}
                      </td>

                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setReportingPcId(pc.id)}
                            className="btn btn-secondary text-xs py-1 px-2.5 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                            title="Abrir Chamado / Defeito"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Chamado</span>
                          </button>
                          <button
                            onClick={() => setEditingPc(pc)}
                            className="btn-icon w-8 h-8 rounded-lg"
                            title="Editar Dados da Máquina"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Deseja remover o computador ${pc.nome_host} (${pc.patrimonio})?`)) {
                                removerComputador(pc.id);
                              }
                            }}
                            className="btn-icon w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                            title="Remover Computador"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Cadastro */}
      <AddComputerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={adicionarComputador}
      />

      {/* Modal de Edição */}
      {editingPc && (
        <Modal
          isOpen={!!editingPc}
          onClose={() => setEditingPc(null)}
          title={`Editar ${editingPc.nome_host}`}
          subtitle="Atualize os dados e configurações do equipamento"
          icon={<Edit3 className="w-5 h-5" />}
        >
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--text-main)] block mb-1">
                Nome do Host
              </label>
              <input
                type="text"
                required
                value={editingPc.nome_host}
                onChange={(e) => setEditingPc({ ...editingPc, nome_host: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[12px] text-xs font-mono font-bold text-[var(--text-main)] focus:border-[var(--border-focus)] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-main)] block mb-1">
                Patrimônio UFPI
              </label>
              <input
                type="text"
                required
                value={editingPc.patrimonio}
                onChange={(e) => setEditingPc({ ...editingPc, patrimonio: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[12px] text-xs font-mono text-[var(--text-main)] focus:border-[var(--border-focus)] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-main)] block mb-1">
                Status Operacional
              </label>
              <select
                value={editingPc.status}
                onChange={(e) => setEditingPc({ ...editingPc, status: e.target.value as ComputerStatus })}
                className="w-full px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[12px] text-xs text-[var(--text-main)] font-medium focus:border-[var(--border-focus)] outline-none"
              >
                <option value="disponivel">Disponível</option>
                <option value="ocupado">Ocupado</option>
                <option value="manutencao">Manutenção</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-main)] block mb-1">
                Especificações Técnicas
              </label>
              <textarea
                rows={3}
                value={editingPc.especificacoes || ''}
                onChange={(e) => setEditingPc({ ...editingPc, especificacoes: e.target.value })}
                className="w-full p-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[12px] text-xs text-[var(--text-main)] focus:border-[var(--border-focus)] outline-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setEditingPc(null)}
                className="btn btn-secondary text-xs"
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary text-xs">
                <span>Salvar Alterações</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal de Abertura de Chamado */}
      <IssueModal
        isOpen={reportingPcId !== null}
        onClose={() => setReportingPcId(null)}
        computadores={computadores}
        initialPcId={reportingPcId}
        onSubmit={(pcId, desc) => {
          registrarProblema(pcId, desc);
          setReportingPcId(null);
        }}
      />
    </div>
  );
}
