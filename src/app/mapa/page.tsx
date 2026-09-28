'use client';

import React, { useState } from 'react';
import {
  PlusCircle,
  Presentation,
  Grid,
  CheckCircle2,
  Wrench,
  Users,
  Search,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { useLab } from '@/context/LabContext';
import { Computador, ComputerStatus } from '@/types';
import ComputerNode from '@/components/mapa/ComputerNode';
import ComputerDetailModal from '@/components/mapa/ComputerDetailModal';
import AddComputerModal from '@/components/mapa/AddComputerModal';
import Badge from '@/components/ui/Badge';
import SearchInput from '@/components/ui/SearchInput';
import EmptyState from '@/components/ui/EmptyState';

export default function LabMapPage() {
  const {
    computadores,
    controleComputadores,
    alunos,
    problemas,
    getAlunosPresentes,
    iniciarUsoComputador,
    encerrarUsoComputador,
    resolverProblema,
    adicionarComputador,
    registrarProblema
  } = useLab();

  const [selectedPc, setSelectedPc] = useState<Computador | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ComputerStatus>('all');

  const alunosPresentesSemPc = getAlunosPresentes().filter(p => !p.computadorEmUso);

  const getPcDetails = (pc: Computador) => {
    const sessaoAtiva = controleComputadores.find(s => s.computador_id === pc.id && !s.fim_uso);
    let alunoAtual = null;
    let tempoUsoMin = 0;
    if (sessaoAtiva) {
      alunoAtual = alunos.find(a => a.id === sessaoAtiva.aluno_id);
      const inicio = new Date(sessaoAtiva.inicio_uso).getTime();
      tempoUsoMin = Math.max(1, Math.round((Date.now() - inicio) / 60000));
    }
    const problemasDoPc = problemas.filter(p => p.computador_id === pc.id);
    const hasPendingIssue = problemasDoPc.some(p => p.status === 'pendente');
    return { sessaoAtiva, alunoAtual, tempoUsoMin, problemasDoPc, hasPendingIssue };
  };

  // Filtragem dos computadores
  const filteredPcs = computadores.filter(pc => {
    const matchesSearch = pc.nome_host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pc.patrimonio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const disponiveisCount = computadores.filter(c => c.status === 'disponivel').length;
  const ocupadosCount = computadores.filter(c => c.status === 'ocupado').length;
  const manutencaoCount = computadores.filter(c => c.status === 'manutencao').length;

  return (
    <div className="flex flex-col gap-6">
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-main)] flex items-center gap-2">
            Mapa Interativo da Sala de Informática
            <Badge variant="success" pulse size="sm">Ao Vivo</Badge>
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Disposição física das bancadas • UFPI Campus Senador Helvídio Nunes de Barros (CSHNB)
          </p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
          <PlusCircle className="w-4 h-4" />
          <span>Cadastrar Computador</span>
        </button>
      </div>

      {/* Control Bar: Filters & Fast Stats */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`btn text-xs py-1.5 px-3 ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Todos ({computadores.length})
          </button>
          <button
            onClick={() => setStatusFilter('disponivel')}
            className={`btn text-xs py-1.5 px-3 ${statusFilter === 'disponivel' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Disponíveis ({disponiveisCount})
          </button>
          <button
            onClick={() => setStatusFilter('ocupado')}
            className={`btn text-xs py-1.5 px-3 ${statusFilter === 'ocupado' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
            Em Uso ({ocupadosCount})
          </button>
          <button
            onClick={() => setStatusFilter('manutencao')}
            className={`btn text-xs py-1.5 px-3 ${statusFilter === 'manutencao' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            Manutenção ({manutencaoCount})
          </button>
        </div>

        <div className="w-full sm:w-64">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Filtrar por LAB-01, patrimônio..."
          />
        </div>
      </div>

      {/* Lab Room Container */}
      <div className="bg-[var(--bg-card-subtle)] border-2 border-dashed border-[var(--border-color)] rounded-[24px] p-6 lg:p-8 shadow-sm">
        
        {/* Front of Room / Teacher Stage */}
        <div className="bg-gradient-to-r from-[var(--purple-700)] via-[var(--purple-600)] to-[var(--purple-500)] text-white text-center py-3 px-4 rounded-[14px] text-xs font-bold tracking-wider uppercase mb-8 shadow-[0_4px_16px_var(--primary-glow)] flex items-center justify-center gap-2">
          <Presentation className="w-4 h-4" />
          <span>FRENTE DA SALA • MESA DO PROFESSOR • QUADRO E PROJETOR</span>
        </div>

        {/* Computers Grid */}
        {filteredPcs.length === 0 ? (
          <EmptyState
            title="Nenhum computador encontrado"
            description="Nenhuma máquina corresponde aos filtros selecionados."
            action={
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="btn btn-secondary text-xs"
              >
                Limpar Filtros
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredPcs.map(pc => {
              const details = getPcDetails(pc);
              return (
                <ComputerNode
                  key={pc.id}
                  computador={pc}
                  sessaoAtiva={details.sessaoAtiva}
                  alunoAtual={details.alunoAtual}
                  tempoUsoMin={details.tempoUsoMin}
                  hasPendingIssue={details.hasPendingIssue}
                  onClick={() => setSelectedPc(pc)}
                />
              );
            })}
          </div>
        )}

        {/* Bottom Room Sign */}
        <div className="mt-8 pt-4 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-muted)] flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[var(--primary)]" />
            <span>Clique em qualquer computador para gerenciar uso, alocar aluno ou abrir chamado técnico.</span>
          </div>
          <span className="font-bold uppercase tracking-wider text-[0.7rem]">
            PORTA DE ENTRADA & SAÍDA ➔
          </span>
        </div>
      </div>

      {/* Modal de Detalhes e Ações do Computador */}
      {selectedPc && (
        <ComputerDetailModal
          isOpen={!!selectedPc}
          onClose={() => setSelectedPc(null)}
          computador={selectedPc}
          sessaoAtiva={getPcDetails(selectedPc).sessaoAtiva}
          alunoAtual={getPcDetails(selectedPc).alunoAtual}
          tempoUsoMin={getPcDetails(selectedPc).tempoUsoMin}
          alunosPresentesSemPc={alunosPresentesSemPc}
          problemasDoPc={getPcDetails(selectedPc).problemasDoPc}
          onAlocarAluno={iniciarUsoComputador}
          onEncerrarSessao={encerrarUsoComputador}
          onAbrirChamado={registrarProblema}
          onResolverChamado={resolverProblema}
        />
      )}

      {/* Modal de Adicionar Novo Computador */}
      <AddComputerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={adicionarComputador}
      />
    </div>
  );
}
