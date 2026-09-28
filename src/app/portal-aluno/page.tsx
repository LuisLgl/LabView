'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  Monitor,
  LogIn,
  LogOut,
  AlertTriangle,
  Calendar,
  History,
  GraduationCap,
  Wrench,
  Laptop,
  Sparkles,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useLab } from '@/context/LabContext';
import Modal from '@/components/ui/Modal';

export default function PortalAlunoPage() {
  const {
    loggedAluno,
    alunos,
    computadores,
    controleSala,
    controleComputadores,
    getAlunosPresentes,
    getAlunoMinutosAcumuladosHoje,
    registrarEntradaSala,
    registrarSaidaSala,
    iniciarUsoComputador,
    encerrarUsoComputador,
    registrarProblema
  } = useLab();

  // Somente o aluno autenticado acessa sua conta individual
  const aluno = loggedAluno;

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState<'computador' | 'laboratorio'>('computador');
  const [reportPcId, setReportPcId] = useState<number | null>(null);
  const [reportDescricao, setReportDescricao] = useState('');
  const [selectedNewPcId, setSelectedNewPcId] = useState<number | ''>('');

  // Atualiza relógio em tempo real
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDateStr(now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!aluno) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '24px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <GraduationCap style={{ width: 44, height: 44, color: 'var(--primary)' }} />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)' }}>Área Privada do Estudante</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 8, marginBottom: 24, maxWidth: 420 }}>
          Esta é uma área individual e privada. Faça login com sua matrícula ou nome e sua senha de acesso.
        </p>
        <Link href="/" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '0.9rem', borderRadius: '12px' }}>
          <span>Fazer Login do Estudante</span>
        </Link>
      </div>
    );
  }

  // Verifica se o aluno está atualmente na sala
  const presentes = getAlunosPresentes();
  const presencaAtual = presentes.find(p => p.aluno_id === aluno.id);
  const estaNaSala = !!presencaAtual;

  // Verifica se o aluno está usando algum computador
  const sessaoPCAtiva = controleComputadores.find(cc => cc.aluno_id === aluno.id && !cc.fim_uso);
  const computadorEmUso = sessaoPCAtiva ? computadores.find(c => c.id === sessaoPCAtiva.computador_id) : null;

  // Minutos acumulados hoje
  const minutosHoje = getAlunoMinutosAcumuladosHoje(aluno.id);
  const horasHojeStr = minutosHoje < 60 ? `${minutosHoje} min` : `${Math.floor(minutosHoje / 60)}h ${minutosHoje % 60}m`;

  // Histórico de acessos deste aluno (ordenado do mais recente para o mais antigo)
  const meusAcessos = [...controleSala.filter(c => c.aluno_id === aluno.id)].reverse();

  // Último registro de saída se houver
  const ultimoRegistroFinalizado = meusAcessos.find(c => c.saida);

  // Computadores disponíveis para alocação
  const pcsDisponiveis = computadores.filter(c => c.status === 'disponivel');

  const handleTogglePresenca = () => {
    if (estaNaSala) {
      registrarSaidaSala(aluno.id);
    } else {
      registrarEntradaSala(aluno.id);
    }
  };

  const handleAlocarMeuPc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNewPcId) return;
    iniciarUsoComputador(aluno.id, Number(selectedNewPcId));
    setSelectedNewPcId('');
  };

  const handleLiberarMeuPc = () => {
    if (!computadorEmUso) return;
    encerrarUsoComputador(computadorEmUso.id);
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescricao.trim()) return;

    registrarProblema(
      reportCategory === 'computador' ? reportPcId || (computadorEmUso?.id ?? null) : null,
      reportDescricao.trim(),
      reportCategory
    );

    setReportDescricao('');
    setIsReportModalOpen(false);
  };

  return (
    <div className="portal-container">
      
      {/* 1. Hero Banner do Estudante */}
      <div className="portal-hero">
        <div className="portal-hero-glow" />
        
        <div className="portal-hero-top">
          <div className="portal-student-info">
            <div className="portal-avatar">
              {aluno.nome.charAt(0)}
            </div>
            <div className="portal-student-meta">
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 800, color: '#C7BAFA' }}>
                Estudante UFPI • CSHNB Picos
              </span>
              <h2 className="portal-student-name">{aluno.nome}</h2>
              <div className="portal-student-details">
                <span>Matrícula: <strong style={{ fontFamily: 'var(--font-mono)', color: '#FFFFFF' }}>{aluno.id}</strong></span>
                <span>•</span>
                <span>{aluno.curso}</span>
              </div>
            </div>
          </div>

          <div className="portal-hero-actions">
            <button
              onClick={() => {
                setReportCategory('laboratorio');
                setIsReportModalOpen(true);
              }}
              className="portal-hero-btn portal-hero-btn-report"
            >
              <AlertTriangle style={{ width: 16, height: 16 }} />
              <span>Relatar Problemas</span>
            </button>
          </div>
        </div>

        {/* Barra de Data e Hora de Hoje */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.28)',
          border: '1.5px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          fontSize: '0.82rem',
          color: '#E2DCFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar style={{ width: 16, height: 16, color: '#C7BAFA' }} />
            <span style={{ textTransform: 'capitalize' }}>{currentDateStr || 'Hoje'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#FFFFFF' }}>
            <Clock style={{ width: 16, height: 16, color: '#34D399' }} />
            <span>{currentTime || '--:--:--'}</span>
          </div>
        </div>
      </div>

      {/* 2. Grid de Ações Principais: Ponto Diário & Computador */}
      <div className="portal-grid-2">
        
        {/* Card 1: Registro de Ponto Diário */}
        <div className="portal-card">
          <div>
            <div className="portal-card-header">
              <h3 className="portal-card-title">
                <Clock style={{ width: 22, height: 22, color: 'var(--primary)' }} />
                <span>Ponto Diário de Entrada & Saída</span>
              </h3>
              <span className={`badge-tag ${estaNaSala ? 'badge-presente' : 'badge-fora'}`}>
                {estaNaSala ? '● Presente no Lab' : '○ Fora do Lab'}
              </span>
            </div>

            <p className="portal-card-desc" style={{ marginTop: 10, marginBottom: 18 }}>
              Registre sua presença diariamente ao entrar e sair da sala. O tempo é acumulado automaticamente.
            </p>

            <div className="portal-stat-box">
              <div>
                <span className="portal-stat-title">Horas Acumuladas Hoje:</span>
                <span className="portal-stat-value">{horasHojeStr}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="portal-stat-title">Status Atual:</span>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: estaNaSala ? 'var(--status-available)' : 'var(--text-muted)' }}>
                  {estaNaSala 
                    ? `Entrada às ${new Date(presencaAtual.entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` 
                    : ultimoRegistroFinalizado 
                    ? `Última saída às ${new Date(ultimoRegistroFinalizado.saida!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                    : 'Não registrado agora'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleTogglePresenca}
            className={`portal-action-btn ${estaNaSala ? 'portal-action-btn-exit' : 'portal-action-btn-enter'}`}
          >
            {estaNaSala ? (
              <>
                <LogOut style={{ width: 20, height: 20 }} />
                <span>Registrar Saída do Laboratório</span>
              </>
            ) : (
              <>
                <LogIn style={{ width: 20, height: 20 }} />
                <span>Registrar Entrada no Laboratório</span>
              </>
            )}
          </button>
        </div>

        {/* Card 2: Uso de Computador */}
        <div className="portal-card">
          <div>
            <div className="portal-card-header">
              <h3 className="portal-card-title">
                <Monitor style={{ width: 22, height: 22, color: 'var(--primary)' }} />
                <span>Estação / Computador</span>
              </h3>
              <span className="badge-tag" style={{ background: computadorEmUso ? 'var(--primary-light)' : 'var(--bg-card-subtle)', color: computadorEmUso ? 'var(--primary)' : 'var(--text-muted)' }}>
                {computadorEmUso ? computadorEmUso.nome_host : 'Nenhum PC em uso'}
              </span>
            </div>

            {computadorEmUso ? (
              <div style={{
                marginTop: 14,
                padding: '18px',
                background: 'var(--primary-light)',
                border: '1.5px solid var(--purple-300)',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: 14
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Monitor style={{ width: 24, height: 24 }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                    {computadorEmUso.nome_host}
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Patrimônio: {computadorEmUso.patrimonio}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, display: 'block', marginTop: 2 }}>
                    Em uso desde às {new Date(sessaoPCAtiva!.inicio_uso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 10 }}>
                <p className="portal-card-desc" style={{ marginBottom: 14 }}>
                  Você não está usando um computador no momento. Escolha uma máquina disponível na sala:
                </p>
                <form onSubmit={handleAlocarMeuPc} style={{ display: 'flex', gap: 8 }}>
                  <select
                    value={selectedNewPcId}
                    onChange={(e) => setSelectedNewPcId(e.target.value ? Number(e.target.value) : '')}
                    className="login-select"
                    style={{ height: '48px', fontSize: '0.85rem' }}
                  >
                    <option value="">-- Escolher computador livre ({pcsDisponiveis.length}) --</option>
                    {pcsDisponiveis.map(pc => (
                      <option key={pc.id} value={pc.id}>
                        {pc.nome_host} ({pc.patrimonio})
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={!selectedNewPcId}
                    className="btn btn-primary"
                    style={{ padding: '0 18px', height: '48px', opacity: selectedNewPcId ? 1 : 0.5 }}
                  >
                    Usar
                  </button>
                </form>
              </div>
            )}
          </div>

          {computadorEmUso && (
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button
                onClick={() => {
                  setReportCategory('computador');
                  setReportPcId(computadorEmUso.id);
                  setIsReportModalOpen(true);
                }}
                className="btn btn-secondary"
                style={{ flex: 1, fontSize: '0.82rem', color: '#D97706', borderColor: '#FDE68A' }}
              >
                <Wrench style={{ width: 16, height: 16 }} />
                <span>Relatar Problema no PC</span>
              </button>
              <button
                onClick={handleLiberarMeuPc}
                className="btn btn-secondary"
                style={{ flex: 1, fontSize: '0.82rem', color: '#DC2626', borderColor: '#FECACA' }}
              >
                <LogOut style={{ width: 16, height: 16 }} />
                <span>Liberar Máquina</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 3. Histórico Detalhado: Exibição Clara de Entrada E Saída */}
      <div className="portal-card" style={{ justifyContent: 'flex-start' }}>
        <div className="portal-card-header">
          <h3 className="portal-card-title">
            <History style={{ width: 22, height: 22, color: 'var(--primary)' }} />
            <span>Meus Registros de Presença (Entradas e Saídas)</span>
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            Total de {meusAcessos.length} registros
          </span>
        </div>

        {meusAcessos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 10px', color: 'var(--text-muted)' }}>
            <Clock style={{ width: 40, height: 40, margin: '0 auto 12px auto', opacity: 0.35 }} />
            <p style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>Nenhum registro de presença ainda</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: 4 }}>
              Clique no botão verde acima para registrar sua entrada no laboratório.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '360px', overflowY: 'auto', paddingRight: '4px' }}>
            {meusAcessos.map((ac, idx) => {
              const start = new Date(ac.entrada);
              const end = ac.saida ? new Date(ac.saida) : null;
              const diffMin = end ? Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000)) : null;

              return (
                <div
                  key={ac.id || idx}
                  style={{
                    padding: '16px 20px',
                    background: 'var(--bg-card-subtle)',
                    border: '1.8px solid var(--border-color)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 14
                  }}
                >
                  {/* Data & Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Calendar style={{ width: 15, height: 15, color: 'var(--primary)' }} />
                      <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                        {start.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </strong>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Sessão #{meusAcessos.length - idx}
                    </span>
                  </div>

                  {/* Horários: Entrada & Saída lado a lado */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    {/* Bloco Entrada */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 12px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '10px'
                    }}>
                      <LogIn style={{ width: 16, height: 16, color: '#059669' }} />
                      <div>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800, color: '#059669', display: 'block' }}>
                          Entrada
                        </span>
                        <strong style={{ fontSize: '0.86rem', fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                          {start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </strong>
                      </div>
                    </div>

                    <ArrowRight style={{ width: 14, height: 14, color: 'var(--text-light)' }} />

                    {/* Bloco Saída */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 12px',
                      background: end ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 66, 245, 0.1)',
                      border: end ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(99, 66, 245, 0.3)',
                      borderRadius: '10px'
                    }}>
                      <LogOut style={{ width: 16, height: 16, color: end ? '#DC2626' : 'var(--primary)' }} />
                      <div>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800, color: end ? '#DC2626' : 'var(--primary)', display: 'block' }}>
                          Saída
                        </span>
                        <strong style={{ fontSize: '0.86rem', fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                          {end ? end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Em andamento...'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Duração Total */}
                  <div>
                    {diffMin ? (
                      <span style={{
                        padding: '6px 14px',
                        background: 'var(--bg-input)',
                        borderRadius: '12px',
                        color: 'var(--primary)',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 900,
                        fontSize: '0.88rem',
                        border: '1.5px solid var(--border-color)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        <Clock style={{ width: 14, height: 14 }} />
                        <span>{diffMin < 60 ? `${diffMin} min` : `${Math.floor(diffMin / 60)}h ${diffMin % 60}m`}</span>
                      </span>
                    ) : (
                      <span className="badge-tag badge-presente" style={{ fontSize: '0.78rem', padding: '6px 14px' }}>
                        ● Na Sala Agora
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Relatar Problemas (enviado diretamente para a coordenação e monitores) */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Relatar Problemas no Laboratório"
        subtitle="O chamado será registrado diretamente para a coordenação e equipe técnica"
        icon={<AlertTriangle style={{ width: 22, height: 22, color: '#EF4444' }} />}
      >
        <form onSubmit={handleSendReport} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>
              Onde está o problema? *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                onClick={() => setReportCategory('computador')}
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  border: '1.8px solid',
                  borderColor: reportCategory === 'computador' ? 'var(--primary)' : 'var(--border-color)',
                  background: reportCategory === 'computador' ? 'var(--primary-light)' : 'var(--bg-input)',
                  color: reportCategory === 'computador' ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer'
                }}
              >
                <Laptop style={{ width: 16, height: 16 }} />
                <span>No Computador / PC</span>
              </button>

              <button
                type="button"
                onClick={() => setReportCategory('laboratorio')}
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  border: '1.8px solid',
                  borderColor: reportCategory === 'laboratorio' ? 'var(--primary)' : 'var(--border-color)',
                  background: reportCategory === 'laboratorio' ? 'var(--primary-light)' : 'var(--bg-input)',
                  color: reportCategory === 'laboratorio' ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer'
                }}
              >
                <Sparkles style={{ width: 16, height: 16 }} />
                <span>Na Estrutura / Lab (Ar, Luz, etc.)</span>
              </button>
            </div>
          </div>

          {reportCategory === 'computador' && (
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: 6 }}>
                Selecione o Computador:
              </label>
              <select
                value={reportPcId || (computadorEmUso?.id ?? '')}
                onChange={(e) => setReportPcId(Number(e.target.value))}
                className="login-select"
                style={{ height: '48px' }}
              >
                {computadores.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nome_host} • {c.patrimonio} ({c.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: 6 }}>
              Descreva o problema detalhadamente: *
            </label>
            <textarea
              required
              rows={4}
              value={reportDescricao}
              onChange={(e) => setReportDescricao(e.target.value)}
              placeholder="Ex: PC não liga, monitor piscando, ar-condicionado desligado, teclado falhando tecla Enter..."
              className="login-input"
              style={{ height: 'auto', padding: '12px 16px', lineHeight: 1.4 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 14, borderTop: '1.5px solid var(--border-color)' }}>
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn"
              style={{ background: '#EF4444', color: '#FFFFFF', fontSize: '0.82rem', gap: 6 }}
            >
              <AlertTriangle style={{ width: 16, height: 16 }} />
              <span>Registrar e Enviar Problema</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
