'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Moon,
  Sun,
  RotateCcw,
  QrCode,
  ChevronRight,
  Monitor,
  User,
  X
} from 'lucide-react';
import { useLab } from '@/context/LabContext';

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, resetToDefault, alunos, computadores, registrarEntradaSala, registrarSaidaSala, getAlunosPresentes } = useLab();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickCheckInOpen, setIsQuickCheckInOpen] = useState(false);
  const [quickMatricula, setQuickMatricula] = useState('');

  const titles: Record<string, string> = {
    '/': 'Área do Estudante',
    '/dashboard': 'Dashboard Geral',
    '/mapa': 'Mapa da Sala em Tempo Real',
    '/acesso': 'Controle de Entrada & Saída',
    '/computadores': 'Inventário de Computadores',
    '/alunos': 'Cadastro de Alunos & Matrículas',
    '/ocorrencias': 'Ocorrências & Manutenção',
    '/relatorios': 'Histórico & Relatórios',
    '/usuarios': 'Operadores & Administradores',
    '/portal-aluno': 'Área do Estudante • Acesso & Ponto',
    '/admin': 'Painel Administrativo'
  };

  const currentTitle = titles[pathname] || 'Visão Geral';

  // Busca global
  const filteredPcs = computadores.filter(c =>
    c.nome_host.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.patrimonio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAlunos = alunos.filter(a =>
    a.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.id.includes(searchQuery) ||
    a.curso.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleQuickCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMatricula) return;

    const presentes = getAlunosPresentes();
    const jaPresente = presentes.some(p => p.aluno_id === quickMatricula);

    if (jaPresente) {
      registrarSaidaSala(quickMatricula);
    } else {
      registrarEntradaSala(quickMatricula);
    }
    setQuickMatricula('');
    setIsQuickCheckInOpen(false);
  };

  return (
    <>
      <header className="h-[72px] bg-[var(--bg-card-glass)] backdrop-blur-md border-b border-[var(--border-color)] sticky top-0 z-40 flex items-center justify-between px-8">
        {/* Left Breadcrumb */}
        <div className="flex items-center gap-2 text-[0.95rem]">
          <span className="text-[var(--text-muted)] font-medium">LabView UFPI</span>
          <ChevronRight className="w-4 h-4 text-[var(--text-light)]" />
          <span className="text-[var(--text-main)] font-bold">{currentTitle}</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Global Search */}
          <div className="relative w-52 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar aluno ou PC..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(e.target.value.trim().length > 0);
              }}
              onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
              className="w-full pl-8 pr-3 py-1.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-full text-xs text-[var(--text-main)] outline-none focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--primary-glow)] transition-all"
            />

            {/* Dropdown de Resultados da Busca */}
            {isSearchOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[14px] shadow-lg max-h-80 overflow-y-auto p-2 z-50 animate-fade-in">
                {filteredPcs.length === 0 && filteredAlunos.length === 0 ? (
                  <div className="p-3 text-xs text-[var(--text-muted)] text-center">Nenhum resultado encontrado.</div>
                ) : (
                  <>
                    {filteredPcs.length > 0 && (
                      <div>
                        <span className="text-[0.68rem] font-bold text-[var(--text-light)] px-2 py-1 block uppercase">Computadores</span>
                        {filteredPcs.map(pc => (
                          <div
                            key={pc.id}
                            onClick={() => {
                              router.push('/mapa');
                              setIsSearchOpen(false);
                            }}
                            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--primary-light)] cursor-pointer text-xs transition-all"
                          >
                            <div className="w-7 h-7 rounded bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
                              <Monitor className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <strong className="block text-[var(--text-main)]">{pc.nome_host} ({pc.status})</strong>
                              <span className="text-[var(--text-muted)] text-[0.7rem]">{pc.patrimonio}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {filteredAlunos.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[var(--border-subtle)]">
                        <span className="text-[0.68rem] font-bold text-[var(--text-light)] px-2 py-1 block uppercase">Alunos</span>
                        {filteredAlunos.map(aluno => (
                          <div
                            key={aluno.id}
                            onClick={() => {
                              router.push('/alunos');
                              setIsSearchOpen(false);
                            }}
                            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--primary-light)] cursor-pointer text-xs transition-all"
                          >
                            <div className="w-7 h-7 rounded bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <strong className="block text-[var(--text-main)]">{aluno.nome}</strong>
                              <span className="text-[var(--text-muted)] text-[0.7rem]">{aluno.curso} • {aluno.id}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Quick Login button */}
          <Link
            href="/login"
            className="btn btn-secondary text-xs py-1.5 px-3"
            title="Acessar Tela de Login / Alternar Perfil"
          >
            <span>🔐 Login</span>
          </Link>

          {/* Quick Check-in Button */}
          <button
            onClick={() => setIsQuickCheckInOpen(true)}
            className="btn btn-primary text-xs py-1.5 px-3"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Check-in</span>
          </button>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="btn-icon w-8 h-8"
              title="Alternar Modo Escuro / Claro"
            >
              {theme === 'theme-dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                if (confirm('Deseja limpar todos os dados para alimentar do zero?')) {
                  resetToDefault();
                }
              }}
              className="btn-icon w-8 h-8"
              title="Limpar e Zerar Dados para Alimentar"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Modal de Check-in Rápido */}
      {isQuickCheckInOpen && (
        <div className="modal-overlay" onClick={() => setIsQuickCheckInOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
              <h3 className="font-bold text-lg text-[var(--text-main)]">Check-in Rápido de Acesso</h3>
              <button onClick={() => setIsQuickCheckInOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleQuickCheckInSubmit} className="p-6">
              <div className="form-group">
                <label>Selecione ou Informe a Matrícula do Aluno:</label>
                <select
                  value={quickMatricula}
                  onChange={(e) => setQuickMatricula(e.target.value)}
                  className="form-control"
                  required
                >
                  <option value="">Selecione o aluno...</option>
                  {alunos.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.nome} ({a.id}) - {a.curso}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsQuickCheckInOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Registrar Entrada / Saída
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
