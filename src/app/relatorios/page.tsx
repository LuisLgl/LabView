'use client';

import React, { useState } from 'react';
import {
  FileBarChart,
  Download,
  Printer,
  Monitor,
  ScanLine,
  Clock,
  Calendar,
  Users,
  Search,
  CheckCircle2
} from 'lucide-react';
import { useLab } from '@/context/LabContext';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import SearchInput from '@/components/ui/SearchInput';
import EmptyState from '@/components/ui/EmptyState';

export default function RelatoriosPage() {
  const {
    controleComputadores,
    controleSala,
    alunos,
    computadores,
    showToast
  } = useLab();

  const [searchFilter, setSearchFilter] = useState('');
  const [tab, setTab] = useState<'sessoes' | 'acessos'>('sessoes');

  // Métricas calculadas
  const totalSessoes = controleComputadores.length;
  const totalAcessosSala = controleSala.length;

  const totalMinutosUso = controleComputadores.reduce((acc, s) => {
    const inicio = new Date(s.inicio_uso).getTime();
    const fim = s.fim_uso ? new Date(s.fim_uso).getTime() : Date.now();
    return acc + Math.max(1, Math.round((fim - inicio) / 60000));
  }, 0);

  const mediaMinutosPorSessao = totalSessoes > 0 ? Math.round(totalMinutosUso / totalSessoes) : 0;

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID_Sessao,Computador,Patrimonio,Matricula_Aluno,Nome_Aluno,Curso,Inicio_Uso,Fim_Uso,Duracao_Minutos\n";

    controleComputadores.forEach(s => {
      const pc = computadores.find(c => c.id === s.computador_id);
      const aluno = alunos.find(a => a.id === s.aluno_id);
      const dtInicio = new Date(s.inicio_uso);
      const dtFim = s.fim_uso ? new Date(s.fim_uso) : null;
      const duracaoMin = dtFim
        ? Math.max(1, Math.round((dtFim.getTime() - dtInicio.getTime()) / 60000))
        : Math.max(1, Math.round((Date.now() - dtInicio.getTime()) / 60000));

      const row = [
        s.id,
        pc ? pc.nome_host : s.computador_id,
        pc ? pc.patrimonio : '',
        s.aluno_id,
        `"${aluno ? aluno.nome : ''}"`,
        `"${aluno ? aluno.curso : ''}"`,
        s.inicio_uso,
        s.fim_uso || '',
        duracaoMin
      ].join(",");

      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_laboratorio_ufpi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Relatório CSV exportado com sucesso!', 'success');
  };

  const filteredSessoes = controleComputadores.filter(s => {
    const pc = computadores.find(c => c.id === s.computador_id);
    const aluno = alunos.find(a => a.id === s.aluno_id);
    const query = searchFilter.toLowerCase();
    return (
      (pc && pc.nome_host.toLowerCase().includes(query)) ||
      (aluno && aluno.nome.toLowerCase().includes(query)) ||
      s.aluno_id.includes(query)
    );
  });

  const filteredAcessos = controleSala.filter(s => {
    const aluno = alunos.find(a => a.id === s.aluno_id);
    const query = searchFilter.toLowerCase();
    return (
      (aluno && aluno.nome.toLowerCase().includes(query)) ||
      s.aluno_id.includes(query)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-main)]">
            Relatórios de Utilização & Auditoria
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Registro histórico das sessões de computadores e auditoria do fluxo de alunos • UFPI CSHNB
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="btn btn-secondary">
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
          <button onClick={() => window.print()} className="btn btn-primary">
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total de Sessões em PCs"
          value={totalSessoes}
          icon={<Monitor className="w-6 h-6" />}
          subtext={<span className="text-[var(--text-muted)]">Histórico total registrado</span>}
        />
        <StatCard
          title="Total de Acessos à Sala"
          value={totalAcessosSala}
          icon={<Users className="w-6 h-6" />}
          iconBgColor="bg-blue-50 dark:bg-blue-950/40"
          iconColor="text-blue-600 dark:text-blue-400"
          subtext={<span className="text-[var(--text-muted)]">Registros na portaria</span>}
        />
        <StatCard
          title="Tempo Médio por Sessão"
          value={`${mediaMinutosPorSessao} min`}
          icon={<Clock className="w-6 h-6" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/40"
          iconColor="text-emerald-600 dark:text-emerald-400"
          subtext={<span className="text-emerald-600 dark:text-emerald-400 font-semibold">{Math.round(totalMinutosUso / 60)} horas totais computadas</span>}
        />
      </div>

      {/* Tabs & Search */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setTab('sessoes')}
            className={`btn text-xs py-1.5 px-3.5 ${tab === 'sessoes' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Sessões de Computadores ({controleComputadores.length})</span>
          </button>
          <button
            onClick={() => setTab('acessos')}
            className={`btn text-xs py-1.5 px-3.5 ${tab === 'acessos' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>Portaria & Fluxo da Sala ({controleSala.length})</span>
          </button>
        </div>

        <div className="w-full sm:w-72">
          <SearchInput
            value={searchFilter}
            onChange={setSearchFilter}
            placeholder="Filtrar por aluno, matrícula, PC..."
          />
        </div>
      </div>

      {/* Tabela do Relatório Selecionado */}
      {tab === 'sessoes' ? (
        <div className="card">
          <div className="card-header">
            <h3 className="font-bold text-lg text-[var(--text-main)] flex items-center gap-2">
              <Monitor className="w-5 h-5 text-[var(--primary)]" />
              Histórico de Sessões nos Computadores
            </h3>
            <Badge variant="purple">{filteredSessoes.length} registros</Badge>
          </div>

          {filteredSessoes.length === 0 ? (
            <EmptyState
              title="Nenhuma sessão encontrada"
              description="Não foram encontrados registros para o filtro aplicado."
            />
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID Sessão</th>
                    <th>Computador</th>
                    <th>Aluno</th>
                    <th>Curso</th>
                    <th>Início do Uso</th>
                    <th>Término</th>
                    <th className="text-right">Duração</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessoes.map(s => {
                    const pc = computadores.find(c => c.id === s.computador_id);
                    const aluno = alunos.find(a => a.id === s.aluno_id);
                    const dtInicio = new Date(s.inicio_uso);
                    const dtFim = s.fim_uso ? new Date(s.fim_uso) : null;
                    const duracaoMin = dtFim
                      ? Math.max(1, Math.round((dtFim.getTime() - dtInicio.getTime()) / 60000))
                      : Math.max(1, Math.round((Date.now() - dtInicio.getTime()) / 60000));

                    return (
                      <tr key={s.id} className="hover:bg-[var(--bg-card-subtle)] transition-colors">
                        <td>
                          <span className="font-mono text-xs text-[var(--text-muted)]">
                            {s.id.slice(0, 8)}...
                          </span>
                        </td>

                        <td>
                          <span className="badge-tag bg-[var(--primary-light)] text-[var(--primary)] font-mono text-xs font-bold">
                            {pc ? pc.nome_host : `PC #${s.computador_id}`}
                          </span>
                        </td>

                        <td>
                          <div>
                            <strong className="text-sm text-[var(--text-main)] block">
                              {aluno ? aluno.nome : s.aluno_id}
                            </strong>
                            <span className="text-[0.68rem] text-[var(--text-muted)] font-mono">{s.aluno_id}</span>
                          </div>
                        </td>

                        <td className="text-xs text-[var(--text-muted)]">{aluno?.curso || '-'}</td>

                        <td className="text-xs text-[var(--text-main)] font-mono">
                          {dtInicio.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>

                        <td className="text-xs font-mono">
                          {dtFim ? (
                            <span className="text-[var(--text-main)]">
                              {dtFim.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          ) : (
                            <Badge variant="purple" size="sm" pulse>Em Aberto</Badge>
                          )}
                        </td>

                        <td className="text-right font-mono font-bold text-xs text-[var(--primary)]">
                          {duracaoMin < 60 ? `${duracaoMin} min` : `${Math.floor(duracaoMin / 60)}h ${duracaoMin % 60}m`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 className="font-bold text-lg text-[var(--text-main)] flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-[var(--primary)]" />
              Auditoria de Entradas e Saídas na Portaria
            </h3>
            <Badge variant="purple">{filteredAcessos.length} registros</Badge>
          </div>

          {filteredAcessos.length === 0 ? (
            <EmptyState
              title="Nenhum acesso registrado"
              description="Não foram encontrados registros para o filtro aplicado."
            />
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID Acesso</th>
                    <th>Aluno</th>
                    <th>Matrícula</th>
                    <th>Curso</th>
                    <th>Entrada</th>
                    <th>Saída</th>
                    <th className="text-right">Status do Acesso</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAcessos.map(s => {
                    const aluno = alunos.find(a => a.id === s.aluno_id);
                    const dtEntrada = new Date(s.entrada);
                    const dtSaida = s.saida ? new Date(s.saida) : null;

                    return (
                      <tr key={s.id} className="hover:bg-[var(--bg-card-subtle)] transition-colors">
                        <td>
                          <span className="font-mono text-xs text-[var(--text-muted)]">
                            {s.id.slice(0, 8)}...
                          </span>
                        </td>

                        <td>
                          <strong className="text-sm text-[var(--text-main)]">
                            {aluno ? aluno.nome : s.aluno_id}
                          </strong>
                        </td>

                        <td>
                          <span className="font-mono text-xs font-bold text-[var(--text-main)] bg-[var(--bg-input)] px-2.5 py-1 rounded-[8px] border border-[var(--border-color)]">
                            {s.aluno_id}
                          </span>
                        </td>

                        <td className="text-xs text-[var(--text-muted)]">{aluno?.curso || '-'}</td>

                        <td className="text-xs text-[var(--text-main)] font-mono">
                          {dtEntrada.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>

                        <td className="text-xs font-mono">
                          {dtSaida ? (
                            <span className="text-[var(--text-main)]">
                              {dtSaida.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          ) : (
                            <span className="text-[var(--status-available)] font-bold">Presente na Sala</span>
                          )}
                        </td>

                        <td className="text-right">
                          {dtSaida ? (
                            <Badge variant="neutral" size="sm">Finalizado</Badge>
                          ) : (
                            <Badge variant="success" size="sm" pulse>Na Sala</Badge>
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
      )}
    </div>
  );
}
