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

// Chave de armazenamento limpa
const DB_KEY = 'LABVIEW_UFPI_STORAGE_PROD_V1';
const AUTH_KEY = 'LABVIEW_UFPI_AUTH_SESSION_PROD_V1';

// Dados padrão iniciais vazios para o usuário cadastrar
const initialUsuarios: Usuario[] = [];

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
  currentUser: Usuario | null;
  authMode: AuthMode;
  loggedAluno: Aluno | null;
  isAuthenticated: boolean;
  toasts: ToastNotification[];
  theme: 'theme-light' | 'theme-dark';
  toggleTheme: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  loginAsAdmin: (userIdOrEmail: string, senha?: string) => Promise<boolean>;
  loginAsAluno: (identificacao: string, senha?: string) => Promise<boolean>;
  logout: () => void;
  getAlunosPresentes: () => AlunoPresente[];
  getAlunoMinutosAcumuladosHoje: (alunoId: string) => number;
  registrarEntradaSala: (alunoId: string) => Promise<void>;
  registrarSaidaSala: (alunoId: string) => Promise<void>;
  iniciarUsoComputador: (alunoId: string, computadorId: number) => Promise<void>;
  encerrarUsoComputador: (computadorId: number) => Promise<void>;
  adicionarAluno: (aluno: Omit<Aluno, 'criado_em' | 'cadastrado_por'>) => void;
  editarAluno: (id: string, aluno: Partial<Aluno>) => void;
  removerAluno: (id: string) => void;
  adicionarComputador: (pc: Omit<Computador, 'id' | 'cadastrado_por'>) => void;
  editarComputador: (id: number, pc: Partial<Computador>) => void;
  removerComputador: (id: number) => void;
  registrarProblema: (
      computadorId: number | null,
      descricao: string,
      categoria?: IssueCategory
    ) => Promise<void>;

  resolverProblema: (problemaId: string) => Promise<void>
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
  const [activeUserId, setActiveUserId] = useState<string>("");
  const [authMode, setAuthMode] = useState<AuthMode>('admin');
  const [loggedAlunoId, setLoggedAlunoId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'theme-light' | 'theme-dark'>('theme-light');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Inicialização segura do LocalStorage
  useEffect(() => {
  const carregarEstado = async () => {
    try {
      if (typeof window !== 'undefined') {
        // Carrega dados armazenados localmente
        const stored = localStorage.getItem(DB_KEY);

        if (stored && stored.trim().startsWith('{')) {
          const parsed = JSON.parse(stored);

          if (Array.isArray(parsed.usuarios)) setUsuarios(parsed.usuarios);
          if (Array.isArray(parsed.alunos)) setAlunos(parsed.alunos);
          if (Array.isArray(parsed.computadores)) setComputadores(parsed.computadores);
          if (Array.isArray(parsed.controleSala)) setControleSala(parsed.controleSala);
          if (Array.isArray(parsed.controleComputadores)) setControleComputadores(parsed.controleComputadores);
          if (Array.isArray(parsed.problemas)) setProblemas(parsed.problemas);
        }

        // Carrega o tema salvo
        const savedTheme =
          (localStorage.getItem('LABVIEW_THEME') as 'theme-light' | 'theme-dark') ||
          'theme-light';

        setTheme(savedTheme);
        document.body.className = savedTheme;
      }

      // Verifica a sessão real no servidor
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        setActiveUserId('');
        setLoggedAlunoId(null);
        setAuthMode('admin');
        return;
      }

      const data = await response.json();
      const usuario = data.usuario;

      if (!data.autenticado || !usuario) {
        setActiveUserId('');
        setLoggedAlunoId(null);
        setAuthMode('admin');
        return;
      }

      if (data.tipo === 'admin') {
        setUsuarios((anteriores) => {
          const outros = anteriores.filter((u) => u.id !== usuario.id);

          return [
            ...outros,
            {
              id: usuario.id,
              nome: usuario.nome,
              email: usuario.email,
              perfil: usuario.perfil,
              status_aprovacao: usuario.statusAprovacao,
              criado_em: usuario.criadoEm,
            },
          ];
        });

        setActiveUserId(usuario.id);
        setLoggedAlunoId(null);
        setAuthMode('admin');
      } else if (data.tipo === 'aluno') {
        setAlunos((anteriores) => {
          const outros = anteriores.filter((a) => a.id !== usuario.id);

          return [
            ...outros,
            {
              id: usuario.id,
              nome: usuario.nome,
              email: usuario.email,
              curso: usuario.curso,
              status: usuario.status,
              cadastrado_por: usuario.cadastradoPor ?? '',
              criado_em: usuario.criadoEm,
            },
          ];
        });

        setLoggedAlunoId(usuario.id);
        setActiveUserId('');
        setAuthMode('aluno');
      }

      // Carrega computadores
      const computadoresResponse = await fetch('/api/computadores', {
        method: 'GET',
        cache: 'no-store',
      });

      if (computadoresResponse.ok) {
        const computadoresData = await computadoresResponse.json();

        if (Array.isArray(computadoresData)) {
          setComputadores(
            computadoresData.map((pc) => ({
              id: pc.id,
              patrimonio: pc.patrimonio,
              nome_host: pc.nome_host,
              status: pc.status,
              especificacoes: pc.especificacoes ?? '',
              cadastrado_por: pc.cadastrado_por,
            }))
          );
        }
      } else {
        console.error('Não foi possível carregar os computadores.');
      }

      // Carrega histórico de entrada e saída da sala
      if (data.tipo === 'admin') {
        const acessosResponse = await fetch('/api/controle-sala', {
          method: 'GET',
          cache: 'no-store',
        });

        if (acessosResponse.ok) {
          const acessosData = await acessosResponse.json();

          if (Array.isArray(acessosData)) {
            setControleSala(
              acessosData.map((acesso) => ({
                id: acesso.id,
                aluno_id: acesso.aluno_id,
                entrada: new Date(acesso.entrada).toISOString(),
                saida: acesso.saida
                  ? new Date(acesso.saida).toISOString()
                  : null,
              }))
            );
          }
        } else {
          console.error('Não foi possível carregar o histórico de acesso à sala.');
        }

        // Carrega histórico de uso dos computadores
        const sessoesResponse = await fetch('/api/controle-computadores', {
          method: 'GET',
          cache: 'no-store',
        });

        if (sessoesResponse.ok) {
          const sessoesData = await sessoesResponse.json();

          if (Array.isArray(sessoesData)) {
            setControleComputadores(
              sessoesData.map((sessao) => ({
                id: sessao.id,
                aluno_id: sessao.aluno_id,
                computador_id: sessao.computador_id,
                inicio_uso: new Date(sessao.inicio_uso).toISOString(),
                fim_uso: sessao.fim_uso
                  ? new Date(sessao.fim_uso).toISOString()
                  : null,
              }))
            );
          }
        } else {
          console.error('Não foi possível carregar o histórico de uso dos computadores.');
        }
      }

    } catch (error) {
      console.error('Erro ao carregar estado do sistema:', error);
      setActiveUserId('');
      setLoggedAlunoId(null);
      setAuthMode('admin');
    } finally {
      setIsLoaded(true);
    }
  };

  carregarEstado();
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
    };

    localStorage.setItem(DB_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('Erro ao salvar:', e);
  }
}, [
  usuarios,
  alunos,
  computadores,
  controleSala,
  controleComputadores,
  problemas,
  isLoaded,
]);
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

  const currentUser = activeUserId ? usuarios.find((u) => u.id === activeUserId) || null : null;
  const loggedAluno = loggedAlunoId ? alunos.find((a) => a.id === loggedAlunoId) || null : null;
  const isAuthenticated = authMode === 'admin' ? !!currentUser : !!loggedAluno;

  // Login como Administrador
  const loginAsAdmin = async (
  userIdOrEmail: string,
  senha?: string
): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: 'admin',
        identificador: userIdOrEmail.trim(),
        senha: senha ?? '',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.error || 'E-mail ou senha incorretos.', 'error');
      return false;
    }

    const usuario = data.usuario;

    setUsuarios((anteriores) => {
      const outros = anteriores.filter((u) => u.id !== usuario.id);

      return [
        ...outros,
        {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil,
          status_aprovacao: usuario.statusAprovacao,
          criado_em: usuario.criadoEm,
        },
      ];
    });

    setActiveUserId(usuario.id);
    setAuthMode('admin');
    setLoggedAlunoId(null);

    showToast('Login realizado com sucesso!', 'success');
    return true;
  } catch (error) {
    console.error('Erro no login administrativo:', error);
    showToast('Não foi possível conectar ao servidor.', 'error');
    return false;
  }
};

  // Login como Aluno (Privado: Matrícula OU Nome + Senha)
  const loginAsAluno = async (
  identificacao: string,
  senha?: string
): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo: 'aluno',
        identificador: identificacao.trim(),
        senha: senha ?? '',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.error || 'Matrícula ou senha incorretas.', 'error');
      return false;
    }

    const aluno = data.usuario;

    setAlunos((anteriores) => {
      const outros = anteriores.filter((a) => a.id !== aluno.id);

      return [
        ...outros,
        {
          id: aluno.id,
          nome: aluno.nome,
          email: aluno.email,
          curso: aluno.curso,
          status: aluno.status,
          cadastrado_por: aluno.cadastradoPor ?? '',
          criado_em: aluno.criadoEm,
        },
      ];
    });

    setLoggedAlunoId(aluno.id);
    setActiveUserId('');
    setAuthMode('aluno');

    showToast('Login realizado com sucesso!', 'success');
    return true;
  } catch (error) {
    console.error('Erro no login do aluno:', error);
    showToast('Não foi possível conectar ao servidor.', 'error');
    return false;
  }
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


const registrarEntradaSala = async (alunoId: string): Promise<void> => {
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

  const jaPresente = controleSala.find(
    (c) => c.aluno_id === trimmedId && !c.saida
  );

  if (jaPresente) {
    showToast(`O aluno ${aluno.nome} já possui entrada aberta na sala.`, 'error');
    return;
  }

  try {
    const response = await fetch('/api/controle-sala', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aluno_id: trimmedId }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.error || 'Não foi possível registrar a entrada.', 'error');
      return;
    }

    if (data.action !== 'checkin') {
      showToast('O registro não corresponde a uma entrada. Atualize os dados.', 'error');
      return;
    }

    setControleSala((prev) => [
      data.acesso,
      ...prev.filter((c) => c.id !== data.acesso.id),
    ]);

    showToast(`Entrada confirmada: ${aluno.nome}`, 'success');
  } catch (error) {
    console.error('Erro ao registrar entrada:', error);
    showToast('Não foi possível conectar ao servidor.', 'error');
  }
};

const registrarSaidaSala = async (alunoId: string): Promise<void> => {
  const trimmedId = alunoId.trim();

  const acessoAberto = controleSala.find(
    (c) => c.aluno_id === trimmedId && !c.saida
  );

  if (!acessoAberto) {
    showToast(`Nenhum registro de entrada aberto para matrícula ${trimmedId}.`, 'error');
    return;
  }

  try {
    const response = await fetch('/api/controle-sala', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aluno_id: trimmedId }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.error || 'Não foi possível registrar a saída.', 'error');
      return;
    }

    if (data.action !== 'checkout') {
      showToast('O registro não corresponde a uma saída. Atualize os dados.', 'error');
      return;
    }

    setControleSala((prev) =>
      prev.map((c) =>
        c.id === data.acesso.id ? data.acesso : c
      )
    );

    // Atualiza o computador que a API encerrou, se houver.
    setControleComputadores((prev) =>
      prev.map((cc) =>
        cc.aluno_id === trimmedId && !cc.fim_uso
          ? { ...cc, fim_uso: data.acesso.saida }
          : cc
      )
    );

    showToast(
      `Saída registrada: ${alunos.find((a) => a.id === trimmedId)?.nome || trimmedId}. Até logo!`,
      'info'
    );
  } catch (error) {
    console.error('Erro ao registrar saída:', error);
    showToast('Não foi possível conectar ao servidor.', 'error');
  }
};


  const iniciarUsoComputador = async (alunoId: string, computadorId: number) => {
  const pc = computadores.find((c) => c.id === computadorId);

  if (!pc) {
    showToast('Computador não encontrado.', 'error');
    return;
  }

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

  try {
    const response = await fetch('/api/controle-computadores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        aluno_id: alunoId,
        computador_id: computadorId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.error || 'Não foi possível iniciar o uso do computador.', 'error');
      return;
    }

    // A API pode retornar a sessão diretamente ou dentro de "sessao".
    const sessao = data.sessao ?? data;

    if (!sessao.id) {
      showToast('A API não retornou os dados da sessão.', 'error');
      return;
    }

    const inicioUso = new Date(
      sessao.inicio_uso ?? sessao.inicioUso ?? new Date()
    ).toISOString();

    const novaSessao: ControleComputadores = {
      id: sessao.id,
      aluno_id: sessao.aluno_id ?? sessao.alunoId ?? alunoId,
      computador_id: sessao.computador_id ?? sessao.computadorId ?? computadorId,
      inicio_uso: inicioUso,
      fim_uso: sessao.fim_uso ?? sessao.fimUso ?? null,
    };

    // Encerra localmente uma sessão anterior do mesmo aluno.
    setControleComputadores((prev) => {
      const sessoesAtualizadas = prev.map((cc) =>
        cc.aluno_id === alunoId && !cc.fim_uso
          ? { ...cc, fim_uso: inicioUso }
          : cc
      );

      // Evita duplicar a sessão caso a API tenha retornado uma já existente.
      return [
        novaSessao,
        ...sessoesAtualizadas.filter((cc) => cc.id !== novaSessao.id),
      ];
    });

    // Atualiza o acesso à sala localmente, caso ainda não exista um aberto.
    setControleSala((prev) => {
      const estaNaSala = prev.some(
        (acesso) => acesso.aluno_id === alunoId && !acesso.saida
      );

      if (estaNaSala) return prev;

      const novoAcesso: ControleSala = {
        id: `temporario-${Date.now()}`,
        aluno_id: alunoId,
        entrada: inicioUso,
        saida: null,
      };

      return [novoAcesso, ...prev];
    });

    // Atualiza os computadores no banco e sincroniza os estados locais.
    const computadoresResponse = await fetch('/api/computadores', {
      method: 'GET',
      cache: 'no-store',
    });

    if (computadoresResponse.ok) {
      const computadoresData = await computadoresResponse.json();

      if (Array.isArray(computadoresData)) {
        setComputadores(
          computadoresData.map((computador) => ({
            id: computador.id,
            patrimonio: computador.patrimonio,
            nome_host: computador.nome_host,
            status: computador.status,
            especificacoes: computador.especificacoes,
            cadastrado_por: computador.cadastrado_por,
          }))
        );
      }
    }

    showToast(`Aluno ${aluno.nome} alocado no ${pc.nome_host}!`, 'success');
  } catch (error) {
    console.error('Erro ao iniciar uso do computador:', error);
    showToast('Erro de comunicação com o servidor.', 'error');
  }
};

  const encerrarUsoComputador = async (computadorId: number) => {
  const pc = computadores.find((c) => c.id === computadorId);

  try {
    const response = await fetch('/api/controle-computadores', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        computador_id: computadorId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.error || 'Não foi possível encerrar o uso do computador.', 'error');
      return;
    }

    const fimUso = new Date().toISOString();

    setControleComputadores((prev) =>
      prev.map((sessao) =>
        sessao.computador_id === computadorId && !sessao.fim_uso
          ? { ...sessao, fim_uso: fimUso }
          : sessao
      )
    );

    // Usa o status calculado pela API, que considera sessões e problemas pendentes.
    if (data.computador) {
      setComputadores((prev) =>
        prev.map((computador) =>
          computador.id === computadorId
            ? { ...computador, status: data.computador.status }
            : computador
        )
      );
    }

    showToast(
      `Computador ${pc ? pc.nome_host : computadorId} desocupado com sucesso!`,
      'info'
    );
  } catch (error) {
    console.error('Erro ao encerrar uso do computador:', error);
    showToast('Erro de comunicação com o servidor.', 'error');
  }
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

  const registrarProblema = async (
  computadorId: number | null = null,
  descricao: string,
  categoria: IssueCategory = computadorId ? 'computador' : 'laboratorio'
): Promise<void> => {
  try {
    const resposta = await fetch('/api/problemas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        computador_id: computadorId,
        descricao,
        categoria,
      }),
    });

    const data = await resposta.json();

    if (!resposta.ok) {
      throw new Error(data.error || 'Erro ao registrar ocorrência.');
    }

    const novo: ProblemaComputador = {
      id: data.id,
      computador_id: data.computadorId,
      categoria: data.categoria,
      descricao: data.descricao,
      data_registro: data.dataRegistro,
      data_resolucao: data.dataResolucao,
      status: data.status,
      registrado_por: data.registradoPor,
      autor_nome:
        data.aluno?.nome ||
        data.usuario?.nome ||
        'Administrador',
    };

    setProblemas((prev) => [novo, ...prev]);

    if (computadorId) {
      setComputadores((prev) =>
        prev.map((c) =>
          c.id === computadorId
            ? { ...c, status: 'manutencao' }
            : c
        )
      );

      setControleComputadores((prev) =>
        prev.map((cc) =>
          cc.computador_id === computadorId && !cc.fim_uso
            ? { ...cc, fim_uso: new Date().toISOString() }
            : cc
        )
      );

      showToast(
        `Ocorrência aberta para ${
          computadores.find((c) => c.id === computadorId)?.nome_host || 'o PC'
        }!`,
        'success'
      );
    } else {
      showToast('Ocorrência da sala registrada com sucesso!', 'success');
    }
  } catch (error) {
    console.error('Erro ao registrar problema:', error);
    showToast(
      error instanceof Error ? error.message : 'Não foi possível registrar a ocorrência.',
      'error'
    );
  }
};

  const resolverProblema = async (problemaId: string): Promise<void> => {
  try {
    const resposta = await fetch('/api/problemas', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: problemaId }),
    });

    const data = await resposta.json();

    if (!resposta.ok) {
      throw new Error(data.error || 'Erro ao resolver ocorrência.');
    }

    const problema = problemas.find((p) => p.id === problemaId);

    if (!problema) return;

    setProblemas((prev) =>
      prev.map((p) =>
        p.id === problemaId
          ? {
              ...p,
              status: 'resolvido',
              data_resolucao: data.dataResolucao,
            }
          : p
      )
    );

    if (problema.computador_id) {
      const outrosPendentes = problemas.filter(
        (p) =>
          p.computador_id === problema.computador_id &&
          p.id !== problemaId &&
          p.status === 'pendente'
      );

      if (outrosPendentes.length === 0) {
        setComputadores((prev) =>
          prev.map((c) =>
            c.id === problema.computador_id &&
            c.status === 'manutencao'
              ? { ...c, status: 'disponivel' }
              : c
          )
        );
      }
    }

    showToast('Chamado concluído com sucesso!', 'success');
  } catch (error) {
    console.error('Erro ao resolver problema:', error);
    showToast(
      error instanceof Error ? error.message : 'Não foi possível resolver a ocorrência.',
      'error'
    );
  }
};

  const adicionarUsuario = (data: Omit<Usuario, 'id' | 'criado_em'>) => {
    const novo: Usuario = {
      ...data,
      id: 'usr-' + Date.now(),
      status_aprovacao: 'aprovado',
      criado_em: new Date().toISOString()
    };
    setUsuarios((prev) => [...prev, novo]);
    if (!activeUserId) {
      setActiveUserId(novo.id);
    }
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
    if (!activeUserId) {
      setActiveUserId(userId);
    }
    showToast(`Operador ${user.nome} aprovado e ativado no sistema!`, 'success');
    return true;
  };

  const removerUsuario = (userId: string) => {
    const user = usuarios.find(u => u.id === userId);
    if (!user) return;

    const adminsRestantes = usuarios.filter(u => u.perfil === 'Administrador' && u.id !== userId);
    if (user.perfil === 'Administrador' && adminsRestantes.length === 0) {
      showToast('O sistema necessita de pelo menos 1 administrador ativo cadastrado.', 'error');
      return;
    }

    setUsuarios(prev => prev.filter(u => u.id !== userId));
    if (activeUserId === userId) {
      setActiveUserId(adminsRestantes[0]?.id || '');
    }
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
    setUsuarios([]);
    setAlunos([]);
    setComputadores([]);
    setControleSala([]);
    setControleComputadores([]);
    setProblemas([]);
    setActiveUserId("");
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
