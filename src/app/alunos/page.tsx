'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  QrCode,
  Edit3,
  Trash2,
  ScanLine,
  GraduationCap,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { useLab } from '@/context/LabContext';
import { Aluno, StudentStatus } from '@/types';
import StudentCardModal from '@/components/alunos/StudentCardModal';
import SearchInput from '@/components/ui/SearchInput';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

export default function AlunosPage() {
  const {
    alunos,
    removerAluno,
    getAlunosPresentes
  } = useLab();

  const [badgeAluno, setBadgeAluno] = useState<Aluno | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | StudentStatus>('all');
  const [cursoFilter, setCursoFilter] = useState<string>('all');

  const presentes = getAlunosPresentes();

  // Cursos únicos existentes
  const cursos = Array.from(new Set(alunos.map(a => a.curso)));

  // Filtragem
  const filteredAlunos = alunos.filter(a => {
    const matchesSearch =
      a.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.includes(searchQuery) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesCurso = cursoFilter === 'all' || a.curso === cursoFilter;
    return matchesSearch && matchesStatus && matchesCurso;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-main)]">
            Cadastro de Alunos & Matrículas
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Gerenciamento de estudantes, situação acadêmica e emissão de Carteirinhas Digitais UFPI
          </p>
        </div>
        <Link href="/alunos/novo" className="btn btn-primary">
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Aluno</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`btn text-xs py-1.5 px-3 ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Todos ({alunos.length})
          </button>
          <button
            onClick={() => setStatusFilter('ativo')}
            className={`btn text-xs py-1.5 px-3 ${statusFilter === 'ativo' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Ativos ({alunos.filter(a => a.status === 'ativo').length})
          </button>
          <button
            onClick={() => setStatusFilter('suspenso')}
            className={`btn text-xs py-1.5 px-3 ${statusFilter === 'suspenso' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Suspensos ({alunos.filter(a => a.status === 'suspenso').length})
          </button>

          {cursos.length > 1 && (
            <select
              value={cursoFilter}
              onChange={(e) => setCursoFilter(e.target.value)}
              className="px-3 py-1.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[10px] text-xs font-semibold text-[var(--text-main)] outline-none focus:border-[var(--border-focus)]"
            >
              <option value="all">Todos os Cursos</option>
              {cursos.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>

        <div className="w-full sm:w-72">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por nome, matrícula ou e-mail..."
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="card">
        {filteredAlunos.length === 0 ? (
          <EmptyState
            title="Nenhum aluno encontrado"
            description="Tente ajustar os termos de busca ou filtros selecionados."
            action={
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCursoFilter('all');
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
                  <th>Aluno</th>
                  <th>Matrícula (ID)</th>
                  <th>E-mail Institucional</th>
                  <th>Curso</th>
                  <th>Situação</th>
                  <th>Presença</th>
                  <th className="text-right">Carteirinha & Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlunos.map(aluno => {
                  const isPresente = presentes.some(p => p.aluno_id === aluno.id);
                  return (
                    <tr key={aluno.id} className="hover:bg-[var(--bg-card-subtle)] transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-bold text-xs flex items-center justify-center shrink-0">
                            {aluno.nome.charAt(0)}
                          </div>
                          <div>
                            <strong className="text-sm text-[var(--text-main)] block">{aluno.nome}</strong>
                            <span className="text-[0.7rem] text-[var(--text-muted)]">
                              Cadastrado em {new Date(aluno.criado_em).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="font-mono text-xs font-bold text-[var(--text-main)] bg-[var(--bg-input)] px-2.5 py-1 rounded-[8px] border border-[var(--border-color)]">
                          {aluno.id}
                        </span>
                      </td>

                      <td className="text-xs text-[var(--text-muted)]">{aluno.email}</td>

                      <td>
                        <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-main)] font-medium">
                          <GraduationCap className="w-3.5 h-3.5 text-[var(--primary)]" />
                          {aluno.curso}
                        </span>
                      </td>

                      <td>
                        {aluno.status === 'ativo' ? (
                          <Badge variant="success" size="sm">Ativo</Badge>
                        ) : (
                          <Badge variant="danger" size="sm">Suspenso</Badge>
                        )}
                      </td>

                      <td>
                        {isPresente ? (
                          <Badge variant="purple" size="sm" pulse>Na Sala</Badge>
                        ) : (
                          <span className="text-xs text-[var(--text-light)]">Ausente</span>
                        )}
                      </td>

                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setBadgeAluno(aluno)}
                            className="btn btn-secondary text-xs py-1 px-2.5"
                            title="Gerar e Visualizar Carteirinha Digital"
                          >
                            <QrCode className="w-3.5 h-3.5 text-[var(--primary)]" />
                            <span>Crachá</span>
                          </button>
                          <Link
                            href={`/alunos/novo?edit=${aluno.id}`}
                            className="btn-icon w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)]"
                            title="Editar Dados do Aluno"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm(`Deseja remover o aluno ${aluno.nome} (${aluno.id})?`)) {
                                removerAluno(aluno.id);
                              }
                            }}
                            className="btn-icon w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                            title="Remover Cadastro"
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

      {/* Modal de Carteirinha Digital com QR Code */}
      <StudentCardModal
        isOpen={!!badgeAluno}
        onClose={() => setBadgeAluno(null)}
        aluno={badgeAluno}
      />
    </div>
  );
}
