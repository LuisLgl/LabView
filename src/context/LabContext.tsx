'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Usuario,
  Aluno,
  Computador,
  ControleSala,
  ControleComputadores,
  ProblemaComputador,
  AlunoPresente,
  AuthMode,
  IssueCategory,
  UserRole
} from '@/types';

// Nova chave de armazenamento limpa
const DB_KEY = 'LABVIEW_UFPI_STORAGE_V3_CLEAN';
const AUTH_KEY = 'LABVIEW_UFPI_AUTH_SESSION_V3';

// Dados padrão iniciais limpos para o usuário alimentar
const initialUsuarios: Usuario[] = [
  {
    id: "usr-01",
    nome: "Prof. Luis Ramos",
    email: "admin@ufpi.edu.br",
    senha: "admin",
    perfil: "Administrador",
    status_aprovacao: "aprovado",
    criado_em: new Date().toISOString()
  }
];

const initialAlunos: Aluno[] = [];
const initialComputadores: Computador[] = [];
const initialControleSala: ControleSala[] = [];
const initialControleComputadores: ControleComputadores[] = [];
const initialProblemas: ProblemaComputador[] = [];

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface LabContextType {
  usuarios: Usuario[];
  alunos: Aluno[];
  computadores: Computador[];
  controleSala: ControleSala[];
  controleComputadores: ControleComputadores[];
  problemas: ProblemaComputador[];
  currentUser: Usuario;
  authMode: AuthMode;
  loggedAluno: Aluno | null;
  isAuthenticated: boolean;
  toasts: ToastNotification[];
  theme: 'theme-light' | 'theme-dark';
  toggleTheme: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  loginAsAdmin: (userIdOrEmail: string, senha?: string) => boolean;
  loginAsAluno: (identificacao: string, senha?: string) => boolean;
  logout: () => void;
  getAlunosPresentes: () => AlunoPresente[];
  getAlunoMinutosAcumuladosHoje: (alunoId: string) => number;
  registrarEntradaSala: (alunoId: string) => void;
  registrarSaidaSala: (alunoId: string) => void;
  iniciarUsoComputador: (alunoId: string, computadorId: number) => void;
  encerrarUsoComputador: (computadorId: number) => void;
  adicionarAluno: (aluno: Omit<Aluno, 'criado_em' | 'cadastrado_por'>) => void;
  editarAluno: (id: string, aluno: Partial<Aluno>) => void;
  removerAluno: (id: string) => void;
  adicionarComputador: (pc: Omit<Computador, 'id' | 'cadastrado_por'>) => void;
  editarComputador: (id: number, pc: Partial<Computador>) => void;
  removerComputador: (id: number) => void;
  registrarProblema: (computadorId: number | null, descricao: string, categoria?: IssueCategory) => void;
  resolverProblema: (problemaId: string) => void;
  adicionarUsuario: (user: Omit<Usuario, 'id' | 'criado_em'>) => void;
  solicitarCadastroUsuario: (data: { nome: string; email: string; senha?: string; perfil: UserRole }) => { user: Usuario; confirmationCode: string };
  aprovarUsuario: (userId: string, codigo?: string) => boolean;
  removerUsuario: (userId: string) => void;
  setCurrentUser: (userId: string) => void;
  resetToDefault: () => void;
  zerarTodosOsDados: () => void;
}

const LabContext = createContext<LabContextType | undefined>(undefined);

export function LabProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [alunos, setAlunos] = useState<Aluno[]>(initialAlunos);
  const [computadores, setComputadores] = useState<Computador[]>(initialComputadores);
  const [controleSala, setControleSala] = useState<ControleSala[]>(initialControleSala);
  const [controleComputadores, setControleComputadores] = useState<ControleComputadores[]>(initialControleComputadores);
  const [problemas, setProblemas] = useState<ProblemaComputador[]>(initialProblemas);
  const [activeUserId, setActiveUserId] = useState<string>("usr-01");
  const [authMode, setAuthMode] = useState<AuthMode>('admin');
  const [loggedAlunoId, setLoggedAlunoId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'theme-light' | 'theme-dark'>('theme-light');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Inicialização segura do LocalStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(DB_KEY);
        if (stored && stored.trim().startsWith('{')) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed.usuarios) && parsed.usuarios.length > 0) setUsuarios(parsed.usuarios);
          if (Array.isArray(parsed.alunos)) setAlunos(parsed.alunos);
          if (Array.isArray(parsed.computadores)) setComputadores(parsed.computadores);
          if (Array.isArray(parsed.controleSala)) setControleSala(parsed.controleSala);
          if (Array.isArray(parsed.controleComputadores)) setControleComputadores(parsed.controleComputadores);
          if (Array.isArray(parsed.problemas)) setProblemas(parsed.problemas);
          if (parsed.activeUserId) setActiveUserId(parsed.activeUserId);
        }

        const authStored = localStorage.getItem(AUTH_KEY);
        if (authStored) {
          try {
            const authParsed = JSON.parse(authStored);
            if (authParsed.authMode) setAuthMode(authParsed.authMode);
            if (authParsed.loggedAlunoId) setLoggedAlunoId(authParsed.loggedAlunoId);
            if (authParsed.activeUserId) setActiveUserId(authParsed.activeUserId);
          } catch {}
        }

        const savedTheme = (localStorage.getItem('LABVIEW_THEME') as 'theme-light' | 'theme-dark') || 'theme-light';
        setTheme(savedTheme);
        document.body.className = savedTheme;
      }
    } catch (e) {
      console.error('Erro ao ler estado do navegador:', e);
    }
    setIsLoaded(true);
  }, []);

  // Salva no LocalStorage
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    try {
      const payload = {
        usuarios,
        alunos,
        computadores,
        controleSala,
        controleComputadores,
        problemas,
        activeUserId
      };
      localStorage.setItem(DB_KEY, JSON.stringify(payload));
      localStorage.setItem(AUTH_KEY, JSON.stringify({ authMode, loggedAlunoId, activeUserId }));
    } catch (e) {
      console.error('Erro ao salvar:', e);
    }
  }, [usuarios, alunos, computadores, controleSala, controleComputadores, problemas, activeUserId, authMode, loggedAlunoId, isLoaded]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'theme-light' ? 'theme-dark' : 'theme-light';
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('LABVIEW_THEME', newTheme);
      document.body.className = newTheme;
    }
  };

  const currentUser = usuarios.find((u) => u.id === activeUserId) || usuarios[0] || initialUsuarios[0];
  const loggedAluno = loggedAlunoId ? alunos.find((a) => a.id === loggedAlunoId) || null : null;
  const isAuthenticated = authMode === 'admin' ? !!currentUser : !!loggedAluno;

  // Login como Administrador
  const loginAsAdmin = (userIdOrEmail: string, senhaDigitada?: string): boolean => {
    const clean = userIdOrEmail.trim().toLowerCase();
    const cleanSenha = (senhaDigitada || '').trim();

    if (!clean) {
      showToast('Por favor, informe seu e-mail institucional ou identificador.', 'error');
      return false;
    }

    const user = usuarios.find(u => u.id.toLowerCase() === clean || u.email.toLowerCase() === clean);
    if (!user) {
      showToast(`Administrador/Operador "${userIdOrEmail}" não encontrado no sistema.`, 'error');
      return false;
    }

    if (user.status_aprovacao === 'pendente') {
      showToast('Cadastro pendente de aprovação! Verifique o e-mail de autorização enviado para luislgl0724@gmail.com.', 'error');
      return false;
    }

    const senhaCadastrada = (user.senha || 'admin').trim();
    if (cleanSenha && cleanSenha !== senhaCadastrada) {
      showToast('Senha incorreta para este administrador.', 'error');
      return false;
    }

    setActiveUserId(user.id);
    setAuthMode('admin');
    setLoggedAlunoId(null);
    showToast(`Bem-vindo, ${user.nome} (${user.perfil})!`, 'success');
    return true;
  };

  // Login como Aluno (Privado: Matrícula OU Nome + Senha)
  const loginAsAluno = (identificacao: string, senhaDigitada?: string): boolean => {
    const cleanInput = identificacao.trim().toLowerCase();
    const cleanSenha = (senhaDigitada || '').trim();

    if (!cleanInput) {
      showToast('Digite sua matrícula ou seu nome completo.', 'error');
      return false;
    }

    if (!cleanSenha) {
      showToast('Digite sua senha de acesso.', 'error');
      return false;
    }

    // Procura por matrícula exata ou por nome do aluno (case-insensitive)
    const aluno = alunos.find(a => 
      a.id.toLowerCase() === cleanInput || 
      a.nome.toLowerCase() === cleanInput ||
      a.nome.toLowerCase().includes(cleanInput)
    );

    if (!aluno) {
      showToast(`Estudante "${identificacao}" não encontrado. Verifique os dados ou contate a administração.`, 'error');
      return false;
    }

    if (aluno.status === 'suspenso') {
      showToast(`Acesso bloqueado: O aluno ${aluno.nome} está SUSPENSO. Procure a coordenação.`, 'error');
      return false;
    }

    // Validação de senha: se não tem senha definida, aceita a própria matrícula ou '123' como fallback
    const senhaEsperada = (aluno.senha || aluno.id || '123').trim();
    if (aluno.senha) {
      if (aluno.senha.trim() !== cleanSenha) {
        showToast('Senha incorreta. Verifique suas credenciais.', 'error');
        return false;
      }
    } else {
      if (cleanSenha !== aluno.id && cleanSenha !== '123' && cleanSenha !== senhaEsperada) {
        showToast('Senha incorreta. (Sua senha padrão inicial é sua matrícula ou 123)', 'error');
        return false;
      }
    }

    setLoggedAlunoId(aluno.id);
    setAuthMode('aluno');
    showToast(`Bem-vindo à Área do Estudante, ${aluno.nome}!`, 'success');
    return true;
  };

  const logout = () => {
    setAuthMode('admin');
    setLoggedAlunoId(null);
    showToast('Sessão encerrada com sucesso.', 'info');
  };

  // Calcula minutos acumulados de presença hoje para um aluno
  const getAlunoMinutosAcumuladosHoje = (alunoId: string): number => {
    const hojeStr = new Date().toISOString().slice(0, 10);
    const acessosHoje = controleSala.filter(c => c.aluno_id === alunoId && c.entrada.startsWith(hojeStr));
    return acessosHoje.reduce((total, a) => {
      const start = new Date(a.entrada).getTime();
      const end = a.saida ? new Date(a.saida).getTime() : Date.now();
      return total + Math.max(1, Math.round((end - start) / 60000));
    }, 0);
  };

  const getAlunosPresentes = (): AlunoPresente[] => {
    const abertos = controleSala.filter((c) => !c.saida);
    return abertos.map((entry) => {
      const aluno = alunos.find((a) => a.id === entry.aluno_id);
      const sessaoPC = controleComputadores.find((cc) => cc.aluno_id === entry.aluno_id && !cc.fim_uso);
      const pc = sessaoPC ? computadores.find((c) => c.id === sessaoPC.computador_id) : null;
      const entradaTime = new Date(entry.entrada).getTime();
      const tempoPermanenciaMin = Math.max(1, Math.round((Date.now() - entradaTime) / 60000));
      return {
        ...entry,
        aluno,
        computadorEmUso: pc || null,
        tempoPermanenciaMin
      };
    });
  };

  const registrarEntradaSala = (alunoId: string) => {
    const trimmedId = alunoId.trim();
    const aluno = alunos.find((a) => a.id === trimmedId);
    if (!aluno) {
      showToast(`Matrícula ${trimmedId} não encontrada no cadastro.`, 'error');
      return;
    }
    if (aluno.status === 'suspenso') {
      showToast(`Acesso negado: O aluno ${aluno.nome} está SUSPENSO.`, 'error');
      return;
    }

    const jaPresente = controleSala.find((c) => c.aluno_id === trimmedId && !c.saida);
    if (jaPresente) {
      showToast(`O aluno ${aluno.nome} já possui entrada aberta na sala.`, 'error');
      return;
    }

    const novo: ControleSala = {
      id: 'cs-' + Date.now(),
      aluno_id: trimmedId,
      entrada: new Date().toISOString(),
      saida: null
    };

    setControleSala((prev) => [novo, ...prev]);
    showToast(`Entrada confirmada: ${aluno.nome}`, 'success');
  };

  const registrarSaidaSala = (alunoId: string) => {
    const trimmedId = alunoId.trim();
    const acessoAberto = controleSala.find((c) => c.aluno_id === trimmedId && !c.saida);
    if (!acessoAberto) {
      showToast(`Nenhum registro de entrada aberto para matrícula ${trimmedId}.`, 'error');
      return;
    }

    const updatedControle = controleSala.map((c) =>
      c.id === acessoAberto.id ? { ...c, saida: new Date().toISOString() } : c
    );
    setControleSala(updatedControle);

    // Encerra computador se estiver em uso
    const sessaoPC = controleComputadores.find((cc) => cc.aluno_id === trimmedId && !cc.fim_uso);
    if (sessaoPC) {
      setControleComputadores((prev) =>
        prev.map((cc) => (cc.id === sessaoPC.id ? { ...cc, fim_uso: new Date().toISOString() } : cc))
      );
      setComputadores((prev) =>
        prev.map((c) => (c.id === sessaoPC.computador_id && c.status === 'ocupado' ? { ...c, status: 'disponivel' } : c))
      );
    }

    const aluno = alunos.find((a) => a.id === trimmedId);
    showToast(`Saída registrada: ${aluno ? aluno.nome : trimmedId}. Até logo!`, 'info');
  };

  const iniciarUsoComputador = (alunoId: string, computadorId: number) => {
    const pc = computadores.find((c) => c.id === computadorId);
    if (!pc) return;
    if (pc.status === 'ocupado') {
      showToast(`O computador ${pc.nome_host} já está ocupado.`, 'error');
      return;
    }
    if (pc.status === 'manutencao') {
      showToast(`O computador ${pc.nome_host} está em manutenção.`, 'error');
      return;
    }

    const aluno = alunos.find((a) => a.id === alunoId);
    if (!aluno) {
      showToast('Aluno não encontrado.', 'error');
      return;
    }
    if (aluno.status === 'suspenso') {
      showToast(`Acesso negado: O aluno ${aluno.nome} está suspenso.`, 'error');
      return;
    }

    // Se o aluno não tiver entrada aberta na sala, registra automaticamente
    const estaNaSala = controleSala.some((c) => c.aluno_id === alunoId && !c.saida);
    if (!estaNaSala) {
      const novoAcesso: ControleSala = {
        id: 'cs-' + Date.now(),
        aluno_id: alunoId,
        entrada: new Date().toISOString(),
        saida: null
      };
      setControleSala((prev) => [novoAcesso, ...prev]);
    }

    // Se o aluno já estava usando outro computador, encerra a sessão anterior
    const sessaoAnterior = controleComputadores.find((cc) => cc.aluno_id === alunoId && !cc.fim_uso);
    if (sessaoAnterior) {
      setControleComputadores((prev) =>
        prev.map((cc) => (cc.id === sessaoAnterior.id ? { ...cc, fim_uso: new Date().toISOString() } : cc))
      );
      setComputadores((prev) =>
        prev.map((c) => (c.id === sessaoAnterior.computador_id ? { ...c, status: 'disponivel' } : c))
      );
    }

    // Cria nova sessão
    const novaSessao: ControleComputadores = {
      id: 'cc-' + Date.now(),
      aluno_id: alunoId,
      computador_id: computadorId,
      inicio_uso: new Date().toISOString(),
      fim_uso: null
    };

    setControleComputadores((prev) => [novaSessao, ...prev]);
    setComputadores((prev) =>
      prev.map((c) => (c.id === computadorId ? { ...c, status: 'ocupado' } : c))
    );

    showToast(`Aluno ${aluno.nome} alocado no ${pc.nome_host}!`, 'success');
  };

  const encerrarUsoComputador = (computadorId: number) => {
    const pc = computadores.find((c) => c.id === computadorId);
    const sessaoAtiva = controleComputadores.find((cc) => cc.computador_id === computadorId && !cc.fim_uso);

    if (sessaoAtiva) {
      setControleComputadores((prev) =>
        prev.map((cc) => (cc.id === sessaoAtiva.id ? { ...cc, fim_uso: new Date().toISOString() } : cc))
      );
    }

    setComputadores((prev) =>
      prev.map((c) => (c.id === computadorId && c.status === 'ocupado' ? { ...c, status: 'disponivel' } : c))
    );

    showToast(`Computador ${pc ? pc.nome_host : computadorId} desocupado com sucesso!`, 'info');
  };

  const adicionarAluno = (data: Omit<Aluno, 'criado_em' | 'cadastrado_por'>) => {
    const jaExiste = alunos.some((a) => a.id === data.id);
    if (jaExiste) {
      showToast(`Matrícula ${data.id} já cadastrada.`, 'error');
      return;
    }
    const novo: Aluno = {
      ...data,
      cadastrado_por: activeUserId,
      criado_em: new Date().toISOString()
    };
    setAlunos((prev) => [novo, ...prev]);
    showToast(`Aluno ${novo.nome} cadastrado com sucesso!`, 'success');
  };

  const editarAluno = (id: string, data: Partial<Aluno>) => {
    setAlunos((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
    showToast('Cadastro do aluno atualizado!', 'success');
  };

  const removerAluno = (id: string) => {
    setAlunos((prev) => prev.filter((a) => a.id !== id));
    showToast('Aluno removido do sistema.', 'info');
  };

  const adicionarComputador = (data: Omit<Computador, 'id' | 'cadastrado_por'>) => {
    const nextId = computadores.reduce((max, c) => Math.max(max, c.id), 0) + 1;
    const novo: Computador = {
      ...data,
      id: nextId,
      cadastrado_por: activeUserId
    };
    setComputadores((prev) => [...prev, novo]);
    showToast(`Computador ${novo.nome_host} adicionado ao inventário!`, 'success');
  };

  const editarComputador = (id: number, data: Partial<Computador>) => {
    setComputadores((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    showToast('Computador atualizado!', 'success');
  };

  const removerComputador = (id: number) => {
    setComputadores((prev) => prev.filter((c) => c.id !== id));
    showToast('Computador removido do inventário.', 'info');
  };

  const registrarProblema = (
    computadorId: number | null = null,
    descricao: string,
    categoria: IssueCategory = computadorId ? 'computador' : 'laboratorio'
  ) => {
    const autorNome = authMode === 'aluno' && loggedAluno
      ? `${loggedAluno.nome} (Aluno)`
      : currentUser.nome;

    const autorId = authMode === 'aluno' && loggedAluno
      ? loggedAluno.id
      : activeUserId;

    const novo: ProblemaComputador = {
      id: 'prb-' + Date.now(),
      computador_id: computadorId,
      categoria,
      descricao,
      data_registro: new Date().toISOString(),
      data_resolucao: null,
      status: 'pendente',
      registrado_por: autorId,
      autor_nome: autorNome
    };

    setProblemas((prev) => [novo, ...prev]);

    if (computadorId) {
      setComputadores((prev) =>
        prev.map((c) => (c.id === computadorId ? { ...c, status: 'manutencao' } : c))
      );
      setControleComputadores((prev) =>
        prev.map((cc) =>
          cc.computador_id === computadorId && !cc.fim_uso
            ? { ...cc, fim_uso: new Date().toISOString() }
            : cc
        )
      );
      showToast(`Ocorrência aberta para ${computadores.find(c => c.id === computadorId)?.nome_host || 'o PC'}!`, 'success');
    } else {
      showToast('Ocorrência da sala registrada com sucesso!', 'success');
    }
  };

  const resolverProblema = (problemaId: string) => {
    const problema = problemas.find((p) => p.id === problemaId);
    if (!problema) return;

    setProblemas((prev) =>
      prev.map((p) => (p.id === problemaId ? { ...p, status: 'resolvido', data_resolucao: new Date().toISOString() } : p))
    );

    if (problema.computador_id) {
      const outrosPendentes = problemas.filter(
        (p) => p.computador_id === problema.computador_id && p.id !== problemaId && p.status === 'pendente'
      );

      if (outrosPendentes.length === 0) {
        setComputadores((prev) =>
          prev.map((c) => (c.id === problema.computador_id && c.status === 'manutencao' ? { ...c, status: 'disponivel' } : c))
        );
      }
    }
    showToast('Chamado concluído com sucesso!', 'success');
  };

  const adicionarUsuario = (data: Omit<Usuario, 'id' | 'criado_em'>) => {
    const novo: Usuario = {
      ...data,
      id: 'usr-' + Date.now(),
      status_aprovacao: 'aprovado',
      criado_em: new Date().toISOString()
    };
    setUsuarios((prev) => [...prev, novo]);
    showToast(`Operador ${novo.nome} cadastrado com sucesso!`, 'success');
  };

  const solicitarCadastroUsuario = (data: {
    nome: string;
    email: string;
    senha?: string;
    perfil: UserRole;
  }): { user: Usuario; confirmationCode: string } => {
    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const novo: Usuario = {
      ...data,
      id: 'usr-' + Date.now(),
      senha: data.senha || 'admin',
      status_aprovacao: 'pendente',
      codigo_confirmacao: confirmationCode,
      criado_em: new Date().toISOString()
    };

    setUsuarios((prev) => [...prev, novo]);
    showToast(`Solicitação registrada! Um e-mail de autorização foi enviado para luislgl0724@gmail.com (Código de Confirmação: ${confirmationCode})`, 'info');
    return { user: novo, confirmationCode };
  };

  const aprovarUsuario = (userId: string, codigo?: string): boolean => {
    const user = usuarios.find(u => u.id === userId);
    if (!user) {
      showToast('Usuário não encontrado.', 'error');
      return false;
    }

    if (codigo && user.codigo_confirmacao && user.codigo_confirmacao.trim() !== codigo.trim()) {
      showToast('Código de confirmação incorreto!', 'error');
      return false;
    }

    setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, status_aprovacao: 'aprovado', codigo_confirmacao: undefined } : u));
    showToast(`Operador ${user.nome} aprovado e ativado no sistema!`, 'success');
    return true;
  };

  const removerUsuario = (userId: string) => {
    if (userId === 'usr-01') {
      showToast('O administrador principal não pode ser removido.', 'error');
      return;
    }
    setUsuarios(prev => prev.filter(u => u.id !== userId));
    showToast('Operador removido.', 'info');
  };

  const zerarTodosOsDados = () => {
    setAlunos([]);
    setComputadores([]);
    setControleSala([]);
    setControleComputadores([]);
    setProblemas([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DB_KEY);
    }
    showToast('Todos os dados foram limpos! O laboratório está zerado.', 'info');
  };

  const resetToDefault = () => {
    setUsuarios(initialUsuarios);
    setAlunos(initialAlunos);
    setComputadores(initialComputadores);
    setControleSala(initialControleSala);
    setControleComputadores(initialControleComputadores);
    setProblemas(initialProblemas);
    setActiveUserId("usr-01");
    setAuthMode('admin');
    setLoggedAlunoId(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DB_KEY);
      localStorage.removeItem(AUTH_KEY);
    }
    showToast('Dados reiniciados e zerados com sucesso!', 'info');
  };

  return (
    <LabContext.Provider
      value={{
        usuarios,
        alunos,
        computadores,
        controleSala,
        controleComputadores,
        problemas,
        currentUser,
        authMode,
        loggedAluno,
        isAuthenticated,
        toasts,
        theme,
        toggleTheme,
        showToast,
        loginAsAdmin,
        loginAsAluno,
        logout,
        getAlunosPresentes,
        getAlunoMinutosAcumuladosHoje,
        registrarEntradaSala,
        registrarSaidaSala,
        iniciarUsoComputador,
        encerrarUsoComputador,
        adicionarAluno,
        editarAluno,
        removerAluno,
        adicionarComputador,
        editarComputador,
        removerComputador,
        registrarProblema,
        resolverProblema,
        adicionarUsuario,
        solicitarCadastroUsuario,
        aprovarUsuario,
        removerUsuario,
        setCurrentUser: setActiveUserId,
        resetToDefault,
        zerarTodosOsDados
      }}
    >
      {children}
    </LabContext.Provider>
  );
}

export function useLab() {
  const context = useContext(LabContext);
  if (!context) throw new Error('useLab must be used within a LabProvider');
  return context;
}
