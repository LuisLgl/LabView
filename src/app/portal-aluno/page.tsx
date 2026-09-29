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
  ArrowRight,
  Wifi,
  Zap,
  Mouse,
  ThermometerSnowflake,
  MessageSquarePlus,
  ShieldAlert,
  CheckCircle,
  FileText
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
    problemas,
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
  const [reportSubcategory, setReportSubcategory] = useState<string>('Geral');
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

  // Histórico de ocorrências e problemas reportados por este aluno
  const meusProblemas = [...(problemas || []).filter(p => p.registrado_por === aluno.id || p.autor_nome?.includes(aluno.nome))].reverse();

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

  const handleOpenReportModal = (category: 'computador' | 'laboratorio' = 'computador', subcategory: string = 'Geral', pcId: number | null = null) => {
    setReportCategory(category);
    setReportSubcategory(subcategory);
    setReportPcId(pcId || (computadorEmUso?.id ?? null));
    setIsReportModalOpen(true);
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescricao.trim()) return;

    const fullDesc = reportSubcategory && reportSubcategory !== 'Geral'
      ? `[${reportSubcategory}] ${reportDescricao.trim()}`
      : reportDescricao.trim();

    registrarProblema(
      reportCategory === 'computador' ? (reportPcId || (computadorEmUso?.id ?? null)) : null,
      fullDesc,
      reportCategory
    );

    setReportDescricao('');
    setReportSubcategory('Geral');
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
              onClick={() => handleOpenReportModal('laboratorio', 'Estrutura Geral')}
              className="portal-hero-btn portal-hero-btn-report"
            >
              <AlertTriangle style={{ width: 16, height: 16 }} />
              <span>Relatar Problema no Lab</span>
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
                onClick={() => handleOpenReportModal('computador', 'Problema no PC', computadorEmUso.id)}
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

      {/* 3. Central de Relato de Problemas e Chamados do Estudante */}
      <div className="portal-card" style={{ borderColor: 'rgba(239, 68, 68, 0.25)', background: 'var(--bg-card)' }}>
        <div className="portal-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldAlert style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h3 className="portal-card-title" style={{ fontSize: '1.1rem' }}>
                Central de Suporte & Reporte de Falhas
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Encontrou um defeito no computador, teclado, internet ou sala? Notifique a coordenação instantaneamente.
              </span>
            </div>
          </div>

          <button
            onClick={() => handleOpenReportModal('computador', 'Geral')}
            className="btn"
            style={{
              background: '#EF4444',
              color: '#FFFFFF',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '0.84rem',
              fontWeight: 800,
              gap: 8
            }}
          >
            <MessageSquarePlus style={{ width: 17, height: 17 }} />
            <span>Abrir Novo Chamado</span>
          </button>
        </div>

        {/* Atalhos Rápidos para Reportar com 1 Clique */}
        <div style={{ marginTop: 14 }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
            Atalhos Rápidos de Reporte:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
            <button
              onClick={() => handleOpenReportModal('computador', 'Monitor / Sem Vídeo')}
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '10px 14px', borderRadius: '12px', justifyContent: 'flex-start', gap: 8 }}
            >
              <Monitor style={{ width: 16, height: 16, color: '#D97706' }} />
              <span>Monitor / Sem Vídeo</span>
            </button>

            <button
              onClick={() => handleOpenReportModal('computador', 'Teclado ou Mouse Ruim')}
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '10px 14px', borderRadius: '12px', justifyContent: 'flex-start', gap: 8 }}
            >
              <Mouse style={{ width: 16, height: 16, color: '#3B82F6' }} />
              <span>Teclado / Mouse</span>
            </button>

            <button
              onClick={() => handleOpenReportModal('laboratorio', 'Sem Internet / Wi-Fi')}
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '10px 14px', borderRadius: '12px', justifyContent: 'flex-start', gap: 8 }}
            >
              <Wifi style={{ width: 16, height: 16, color: '#8B5CF6' }} />
              <span>Sem Internet / Wi-Fi</span>
            </button>

            <button
              onClick={() => handleOpenReportModal('laboratorio', 'Ar-Condicionado / Climatização')}
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '10px 14px', borderRadius: '12px', justifyContent: 'flex-start', gap: 8 }}
            >
              <ThermometerSnowflake style={{ width: 16, height: 16, color: '#06B6D4' }} />
              <span>Ar-Condicionado</span>
            </button>

            <button
              onClick={() => handleOpenReportModal('laboratorio', 'Tomada / Sem Energia')}
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '10px 14px', borderRadius: '12px', justifyContent: 'flex-start', gap: 8 }}
            >
              <Zap style={{ width: 16, height: 16, color: '#EAB308' }} />
              <span>Tomada / Energia</span>
            </button>
          </div>
        </div>

        {/* Lista de Chamados Anteriores deste Estudante */}
        <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1.5px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText style={{ width: 16, height: 16, color: 'var(--primary)' }} />
              <span>Meus Chamados & Ocorrências ({meusProblemas.length})</span>
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Acompanhamento de resolução em tempo real
            </span>
          </div>

          {meusProblemas.length === 0 ? (
            <div style={{
              padding: '24px 16px',
              textAlign: 'center',
              background: 'var(--bg-card-subtle)',
              borderRadius: '14px',
              border: '1px dashed var(--border-color)'
            }}>
              <CheckCircle style={{ width: 32, height: 32, color: 'var(--status-available)', margin: '0 auto 8px auto', opacity: 0.8 }} />
              <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>Você não possui nenhum chamado aberto</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Tudo em ordem! Caso precise relatar alguma falha, use os botões acima.
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '280px', overflowY: 'auto' }}>
              {meusProblemas.map((prob) => {
                const pcRelacionado = prob.computador_id ? computadores.find(c => c.id === prob.computador_id) : null;
                const isResolvido = prob.status === 'resolvido';

                return (
                  <div
                    key={prob.id}
                    style={{
                      padding: '14px 18px',
                      background: 'var(--bg-card-subtle)',
                      border: '1.5px solid',
                      borderColor: isResolvido ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: isResolvido ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        color: isResolvido ? '#10B981' : '#EF4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 2
                      }}>
                        {isResolvido ? <CheckCircle2 style={{ width: 18, height: 18 }} /> : <AlertTriangle style={{ width: 18, height: 18 }} />}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                            {prob.descricao}
                          </strong>
                          {pcRelacionado && (
                            <span style={{
                              padding: '2px 8px',
                              background: 'var(--primary-light)',
                              color: 'var(--primary)',
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 800
                            }}>
                              PC: {pcRelacionado.nome_host}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: 3 }}>
                          Aberto em {new Date(prob.data_registro).toLocaleString('pt-BR')}
                          {prob.data_resolucao && ` • Resolvido em ${new Date(prob.data_resolucao).toLocaleString('pt-BR')}`}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          padding: '6px 12px',
                          borderRadius: '20px',
                          background: isResolvido ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          color: isResolvido ? '#059669' : '#DC2626',
                          border: `1px solid ${isResolvido ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                        }}
                      >
                        {isResolvido ? (
                          <>
                            <CheckCircle2 style={{ width: 13, height: 13 }} />
                            <span>Resolvido</span>
                          </>
                        ) : (
                          <>
                            <Clock style={{ width: 13, height: 13 }} />
                            <span>Em Análise</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. Histórico Detalhado: Exibição Clara de Entrada E Saída */}
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
        title="Relatar Problema no Laboratório"
        subtitle="Notifique a equipe técnica e coordenação sobre falhas em máquinas ou estrutura"
        icon={<AlertTriangle style={{ width: 22, height: 22, color: '#EF4444' }} />}
      >
        <form onSubmit={handleSendReport} style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 4 }}>
          {/* Seletor de Categoria */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Onde está ocorrendo o problema? *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                type="button"
                onClick={() => setReportCategory('computador')}
                style={{
                  padding: '14px 16px',
                  borderRadius: '16px',
                  border: '2px solid',
                  borderColor: reportCategory === 'computador' ? 'var(--primary)' : 'var(--border-color)',
                  background: reportCategory === 'computador' ? 'var(--primary-light)' : 'var(--bg-card-subtle)',
                  color: reportCategory === 'computador' ? 'var(--primary)' : 'var(--text-main)',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: reportCategory === 'computador' ? '0 4px 12px rgba(99, 66, 245, 0.15)' : 'none'
                }}
              >
                <Laptop style={{ width: 18, height: 18 }} />
                <span>No Computador / PC</span>
              </button>

              <button
                type="button"
                onClick={() => setReportCategory('laboratorio')}
                style={{
                  padding: '14px 16px',
                  borderRadius: '16px',
                  border: '2px solid',
                  borderColor: reportCategory === 'laboratorio' ? 'var(--primary)' : 'var(--border-color)',
                  background: reportCategory === 'laboratorio' ? 'var(--primary-light)' : 'var(--bg-card-subtle)',
                  color: reportCategory === 'laboratorio' ? 'var(--primary)' : 'var(--text-main)',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: reportCategory === 'laboratorio' ? '0 4px 12px rgba(99, 66, 245, 0.15)' : 'none'
                }}
              >
                <Sparkles style={{ width: 18, height: 18 }} />
                <span>Na Sala / Estrutura</span>
              </button>
            </div>
          </div>

          {/* Seção do Computador (quando categoria for computador) */}
          {reportCategory === 'computador' && (
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Computador com defeito:
              </label>
              {computadores.length > 0 ? (
                <select
                  value={reportPcId || (computadorEmUso?.id ?? computadores[0]?.id ?? '')}
                  onChange={(e) => setReportPcId(Number(e.target.value))}
                  className="login-select"
                  style={{
                    height: '48px',
                    fontSize: '0.88rem',
                    width: '100%',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-main)',
                    padding: '0 14px'
                  }}
                >
                  {computadores.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome_host} • {c.patrimonio} {computadorEmUso?.id === c.id ? '(Sua Máquina Atual)' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{
                  padding: '12px 14px',
                  background: 'var(--bg-card-subtle)',
                  border: '1.5px dashed var(--border-color)',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)'
                }}>
                  Nenhum computador cadastrado na sala no momento. O chamado será registrado para o laboratório geral.
                </div>
              )}
            </div>
          )}

          {/* Motivo / Tipo do Problema */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Motivo / Tipo do Defeito:
            </label>
            <select
              value={reportSubcategory}
              onChange={(e) => setReportSubcategory(e.target.value)}
              className="login-select"
              style={{
                height: '48px',
                fontSize: '0.88rem',
                width: '100%',
                borderRadius: '12px',
                border: '1.5px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-main)',
                padding: '0 14px'
              }}
            >
              <option value="Geral">Falha Geral / Outro Motivo</option>
              <option value="Monitor / Sem Vídeo">Monitor não liga ou sem sinal de vídeo</option>
              <option value="Teclado / Mouse com Defeito">Teclado falhando tecla ou mouse ruim</option>
              <option value="Computador Lento / Travando">Sistema operacional travando / reiniciando</option>
              <option value="Sem Internet / Cabo Desconectado">Sem conexão com internet / Wi-Fi fora</option>
              <option value="Ar-Condicionado / Climatização">Ar-condicionado desligado / sala muito quente</option>
              <option value="Tomada / Instalação Elétrica">Tomada sem energia / mau contato</option>
            </select>
          </div>

          {/* Descrição Detalhada */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Descrição Detalhada do Problema: *
            </label>
            <textarea
              required
              rows={4}
              value={reportDescricao}
              onChange={(e) => setReportDescricao(e.target.value)}
              placeholder="Descreva o que está acontecendo (ex: PC travou na tela preta, cabo de força folgado, monitor piscando em azul)..."
              style={{
                width: '100%',
                borderRadius: '14px',
                border: '1.8px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-main)',
                padding: '12px 16px',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                outline: 'none',
                resize: 'vertical',
                minHeight: '100px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Botões do Rodapé */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 12,
            paddingTop: 16,
            borderTop: '1.5px solid var(--border-color)',
            marginTop: 4
          }}>
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="btn btn-secondary"
              style={{
                height: '46px',
                padding: '0 20px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 700
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                height: '46px',
                padding: '0 24px',
                borderRadius: '12px',
                fontSize: '0.86rem',
                fontWeight: 800,
                background: '#EF4444',
                color: '#FFFFFF',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
                transition: 'all 0.15s ease'
              }}
            >
              <AlertTriangle style={{ width: 17, height: 17 }} />
              <span>Enviar Chamado de Suporte</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
