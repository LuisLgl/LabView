'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Grid,
  ScanLine,
  Monitor,
  Users,
  AlertTriangle,
  FileBarChart,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Cpu,
  ArrowRightLeft,
  QrCode,
  GraduationCap
} from 'lucide-react';
import { useLab } from '@/context/LabContext';

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { currentUser, getAlunosPresentes, problemas } = useLab();

  const presentesCount = getAlunosPresentes().length;
  const chamadosPendentes = problemas.filter(p => p.status === 'pendente').length;

  const navItems = [
    { section: 'VISÃO GERAL' },
    { href: '/dashboard', label: 'Dashboard Geral', icon: LayoutDashboard },
    { href: '/mapa', label: 'Mapa da Sala (Ao Vivo)', icon: Grid, isLive: true },
    { section: 'FLUXO & CONTROLE' },
    { href: '/acesso', label: 'Entrada & Saída (Portaria)', icon: ScanLine, badge: presentesCount },
    { href: '/computadores', label: 'Computadores', icon: Monitor },
    { href: '/alunos', label: 'Alunos & Matrículas', icon: Users },
    { section: 'MANUTENÇÃO & SISTEMA' },
    { href: '/ocorrencias', label: 'Ocorrências', icon: AlertTriangle, alertBadge: chamadosPendentes },
    { href: '/relatorios', label: 'Histórico & Relatórios', icon: FileBarChart },
    { href: '/usuarios', label: 'Operadores & Admins', icon: ShieldCheck }
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-50 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[80px]' : 'w-[270px]'
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-[72px] flex items-center justify-between px-5 border-b border-[var(--border-color)]">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden no-underline text-[var(--text-main)]">
          <div className="w-[42px] h-[42px] rounded-[14px] bg-gradient-to-br from-[var(--purple-500)] to-[var(--purple-700)] text-white flex items-center justify-center shrink-0 shadow-[0_0_20px_var(--primary-glow)]">
            <Cpu className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col whitespace-nowrap">
              <span className="font-extrabold text-[1.15rem] tracking-tight flex items-center gap-1.5">
                LabView <span className="text-[0.65rem] font-bold bg-[var(--primary-light)] text-[var(--primary)] px-1.5 py-0.5 rounded">UFPI</span>
              </span>
              <span className="text-[0.72rem] font-medium text-[var(--text-muted)]">CSHNB • Picos - PI</span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn-icon w-8 h-8 rounded-lg"
          title={collapsed ? 'Expandir Menu' : 'Recolher Menu'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 overflow-y-auto flex flex-col gap-1">
        {navItems.map((item, idx) => {
          if (item.section) {
            if (collapsed) return null;
            return (
              <div
                key={idx}
                className="text-[0.68rem] font-extrabold text-[var(--text-light)] px-3 pt-3.5 pb-1.5 tracking-wider uppercase"
              >
                {item.section}
              </div>
            );
          }

          const Icon = item.icon!;
          const isActive = pathname === item.href;

          return (
            <Link
              key={idx}
              href={item.href!}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] font-semibold text-[0.9rem] transition-all no-underline ${
                isActive
                  ? 'bg-gradient-to-r from-[var(--purple-600)] to-[var(--purple-800)] text-white shadow-[0_4px_14px_var(--primary-glow)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.isLive && (
                <span className="w-2 h-2 rounded-full bg-[var(--status-available)] ml-auto shadow-[0_0_8px_var(--status-available)] animate-pulse" />
              )}
              {!collapsed && typeof item.badge === 'number' && (
                <span
                  className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[var(--primary-light)] text-[var(--primary)]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
              {!collapsed && typeof item.alertBadge === 'number' && item.alertBadge > 0 && (
                <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--status-maintenance-bg)] text-[var(--status-maintenance)]">
                  {item.alertBadge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-3 border-t border-[var(--border-color)]">
        <Link
          href="/login"
          className="flex items-center gap-2.5 p-2 bg-[var(--bg-card-subtle)] hover:bg-[var(--primary-light)] border border-[var(--border-color)] rounded-[14px] transition-all no-underline"
          title="Clique para Entrar ou Trocar Perfil (Admin / Aluno)"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--purple-600)] to-[var(--purple-800)] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
            {currentUser?.nome ? currentUser.nome.charAt(0) : 'U'}
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden flex-1">
              <span className="text-xs font-bold text-[var(--text-main)] truncate">{currentUser?.nome || 'Operador'}</span>
              <span className="text-[0.68rem] text-[var(--primary)] font-semibold">{currentUser?.perfil || 'Administrador'}</span>
            </div>
          )}
          {!collapsed && (
            <span className="text-[var(--text-muted)] p-1 hover:text-[var(--primary)]">
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </span>
          )}
        </Link>
      </div>
    </aside>
  );
}
