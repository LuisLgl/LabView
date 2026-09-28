export type UserRole = 'Administrador' | 'Monitor';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  senha_hash?: string;
  perfil: UserRole;
  status_aprovacao?: 'pendente' | 'aprovado';
  codigo_confirmacao?: string;
  criado_em: string;
}

export type StudentStatus = 'ativo' | 'suspenso';

export interface Aluno {
  id: string; // Matrícula
  nome: string;
  email: string;
  senha?: string; // Senha para login na Área do Estudante
  senha_hash?: string;
  curso: string;
  status: StudentStatus;
  cadastrado_por: string;
  criado_em: string;
}

export type ComputerStatus = 'disponivel' | 'ocupado' | 'manutencao';

export interface Computador {
  id: number;
  patrimonio: string;
  nome_host: string;
  status: ComputerStatus;
  especificacoes?: string;
  cadastrado_por: string;
}

export interface ControleSala {
  id: string;
  aluno_id: string;
  entrada: string;
  saida: string | null;
}

export interface ControleComputadores {
  id: string;
  aluno_id: string;
  computador_id: number;
  inicio_uso: string;
  fim_uso: string | null;
}

export type IssueStatus = 'pendente' | 'resolvido';
export type IssueCategory = 'computador' | 'laboratorio';

export interface ProblemaComputador {
  id: string;
  computador_id?: number | null;
  categoria?: IssueCategory; // 'computador' ou 'laboratorio' (ar-condicionado, projetor, internet, etc.)
  descricao: string;
  data_registro: string;
  data_resolucao: string | null;
  status: IssueStatus;
  registrado_por: string;
  autor_nome?: string;
}

export interface AlunoPresente extends ControleSala {
  aluno?: Aluno;
  computadorEmUso?: Computador | null;
  tempoPermanenciaMin: number;
}

export type AuthMode = 'admin' | 'aluno' | 'guest';
