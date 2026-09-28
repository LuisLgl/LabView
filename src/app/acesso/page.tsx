'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  QrCode,
  ScanLine,
  UserCheck,
  UserX,
  Users,
  Clock,
  LogOut,
  Info,
  Check,
  History,
  IdCard,
  LogIn,
  Sparkles
} from 'lucide-react';
import { useLab } from '@/context/LabContext';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

export default function AcessoPage() {
  const {
    alunos,
    controleSala,
    getAlunosPresentes,
    registrarEntradaSala,
    registrarSaidaSala,
    showToast
  } = useLab();

  const [inputMatricula, setInputMatricula] = useState('');
  const presentes = getAlunosPresentes();

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMatricula.trim()) return;
    const matricula = inputMatricula.trim();

    const jaPresente = presentes.some(p => p.aluno_id === matricula);
    if (jaPresente) {
      registrarSaidaSala(matricula);
    } else {
      registrarEntradaSala(matricula);
    }
    setInputMatricula('');
  };

  const handleSimulatedScan = (matricula: string) => {
    const jaPresente = presentes.some(p => p.aluno_id === matricula);
    if (jaPresente) {
      registrarSaidaSala(matricula);
    } else {
      registrarEntradaSala(matricula);
    }
  };

  const calculateDuration = (entrada: string, saida?: string | null) => {
    const start = new Date(entrada).getTime();
    const end = saida ? new Date(saida).getTime() : Date.now();
    const diffMin = Math.max(1, Math.round((end - start) / 60000));
    if (diffMin < 60) return `${diffMin} min`;
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="flex flex-col gap-7">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-main)] flex items-center gap-2">
            Controle de Entrada & Saída da Sala
            <Badge variant="purple" size="sm">Portaria Lab</Badge>
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Portaria e Recepção do Laboratório • UFPI Campus Senador Helvídio Nunes de Barros
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/alunos" className="btn btn-secondary">
            <IdCard className="w-4 h-4" />
            <span>Ver Alunos</span>
          </Link>
        </div>
      </div>

      {/* Scanner & Manual Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Scanner Viewfinder */}
        <div className="bg-[#0D0620] border-2 border-dashed border-[var(--purple-400)] rounded-[24px] p-8 text-white flex flex-col items-center justify-center relative min-h-[340px] shadow-xl overflow-hidden">
          {/* Laser Line */}
          <div className="absolute left-6 right-6 h-0.5 bg-[#8B80F9] shadow-[0_0_15px_#8B80F9] animate-[scanLaser_2.2s_ease-in-out_infinite]" />
          
          {/* Target Box */}
          <div className="w-48 h-48 border-2 border-white/30 rounded-[18px] relative flex items-center justify-center bg-[#8B80F9]/10 backdrop-blur-sm">
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#8B80F9] rounded-tl-[6px]" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#8B80F9] rounded-tr-[6px]" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#8B80F9] rounded-bl-[6px]" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#8B80F9] rounded-br-[6px]" />
            <QrCode className="w-20 h-20 text-[var(--purple-300)] opacity-85 animate-pulse" />
          </div>

          <div className="mt-5 text-center">
            <div className="font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Leitor QR Code / RFID Ativo</span>
            </div>
            <div className="text-xs text-purple-200 opacity-80 mt-1">
              Aproxime a Carteirinha Digital UFPI ou Crachá Estudantil
            </div>
          </div>

          {/* Quick Simulation Buttons */}
          <div className="mt-5 flex flex-wrap gap-2 justify-center items-center">
            <span className="text-[0.72rem] text-purple-300 w-full text-center font-medium">
              Simulação de aproximação de crachá / RFID:
            </span>
            {alunos.map(aluno => {
              const isPresente = presentes.some(p => p.aluno_id === aluno.id);
              const isSuspenso = aluno.status === 'suspenso';
              return (
                <button
                  key={aluno.id}
                  onClick={() => handleSimulatedScan(aluno.id)}
                  className={`btn text-xs py-1.5 px-3 backdrop-blur-md transition-all ${
                    isSuspenso
                      ? 'bg-amber-500/20 text-amber-200 border-amber-400/40 hover:bg-amber-500/30'
                      : isPresente
                      ? 'bg-red-500/20 text-red-200 border-red-400/30 hover:bg-red-500/30'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }`}
                  title={
                    isSuspenso
                      ? `Aluno SUSPENSO: Tentativa de acesso será bloqueada`
                      : isPresente
                      ? 'Registrar Saída do Aluno'
                      : 'Registrar Entrada do Aluno'
                  }
                >
                  {isSuspenso ? (
                    <span className="text-amber-300 font-bold">⚠️</span>
                  ) : isPresente ? (
                    <LogOut className="w-3 h-3 text-red-300" />
                  ) : (
                    <LogIn className="w-3 h-3 text-emerald-300" />
                  )}
                  <span>
                    {aluno.nome.split(' ')[0]} ({isSuspenso ? 'Suspenso' : isPresente ? 'Sair' : 'Entrar'})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Manual Input Form */}
        <div className="card flex flex-col justify-between">
          <div>
            <div className="card-header">
              <h3 className="font-bold text-lg text-[var(--text-main)] flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-[var(--primary)]" />
                Digitação Manual de Matrícula
              </h3>
            </div>
            
            <p className="text-xs text-[var(--text-muted)] mb-5">
              Caso o aluno não esteja com o QR Code no celular ou crachá físico, digite o número da matrícula para registrar o acesso:
            </p>

            <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-main)] block mb-1.5">
                  Número de Matrícula do Aluno *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Ex: 2024901234..."
                    value={inputMatricula}
                    onChange={(e) => setInputMatricula(e.target.value)}
                    className="flex-1 px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[14px] font-mono text-sm font-bold text-[var(--text-main)] focus:border-[var(--border-focus)] outline-none"
                  />
                  <button type="submit" className="btn btn-primary px-6">
                    <span>Confirmar</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="p-4 bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-[16px] flex items-center gap-3 mt-6">
            <div className="w-10 h-10 rounded-full bg-[var(--status-available-bg)] text-[var(--status-available)] flex items-center justify-center shrink-0 font-extrabold text-sm">
              {presentes.length}
            </div>
            <div>
              <strong className="text-xs text-[var(--text-main)] block">Alunos Presentes no Momento</strong>
              <span className="text-[0.72rem] text-[var(--text-muted)]">
                {presentes.filter(p => p.computadorEmUso).length} utilizando computadores e {presentes.filter(p => !p.computadorEmUso).length} em estudo livre
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Tabela de Alunos Presentes & Registro Recente */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-bold text-lg text-[var(--text-main)] flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--primary)]" />
            Alunos Presentes na Sala ({presentes.length})
          </h3>
          <span className="text-xs text-[var(--text-muted)]">
            Acesso físico controlado em tempo real
          </span>
        </div>

        {presentes.length === 0 ? (
          <EmptyState
            title="Nenhum aluno no laboratório"
            description="Utilize o leitor de QR Code ou o campo manual acima para registrar a entrada de estudantes."
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Matrícula</th>
                  <th>Curso</th>
                  <th>Horário de Entrada</th>
                  <th>Tempo de Permanência</th>
                  <th>Estação / PC</th>
                  <th className="text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {presentes.map(p => (
                  <tr key={p.id} className="hover:bg-[var(--bg-card-subtle)] transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center font-bold text-xs">
                          {p.aluno?.nome.charAt(0) || '?'}
                        </div>
                        <strong className="text-sm text-[var(--text-main)]">{p.aluno?.nome}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="font-mono text-xs font-bold text-[var(--text-main)] bg-[var(--bg-input)] px-2.5 py-1 rounded-[8px] border border-[var(--border-color)]">
                        {p.aluno_id}
                      </span>
                    </td>

                    <td className="text-xs text-[var(--text-muted)]">{p.aluno?.curso}</td>

                    <td className="text-xs text-[var(--text-main)] font-mono">
                      {new Date(p.entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="text-xs text-[var(--primary)] font-semibold">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{calculateDuration(p.entrada)}</span>
                      </div>
                    </td>

                    <td>
                      {p.computadorEmUso ? (
                        <span className="badge-tag badge-ocup text-xs font-mono">
                          {p.computadorEmUso.nome_host}
                        </span>
                      ) : (
                        <span className="badge-tag bg-[var(--border-subtle)] text-[var(--text-muted)] text-xs">
                          Mesa / Sem PC
                        </span>
                      )}
                    </td>

                    <td className="text-right">
                      <button
                        onClick={() => registrarSaidaSala(p.aluno_id)}
                        className="btn btn-secondary text-xs py-1 px-3 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Registrar Saída do Aluno"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Dar Saída</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
