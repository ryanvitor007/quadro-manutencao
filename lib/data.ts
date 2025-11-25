// lib/data.ts

export type StatusSolicitacao = "pendente" | "em_andamento" | "concluida" | "cancelada"

export type PrioridadeSolicitacao = "A" | "B" | "C"

export type TipoServico = "Mecânica" | "Elétrica"

export interface Operador {
  id: string
  nome: string
  setor: string
  maquina: string
  maquinaId?: string
}

export interface Encarregado {
  id: string
  nome: string
  usuario: string
}

export interface Maquina {
  id: string
  nome: string
  setor: string
  codigo: string
}

export interface Solicitacao {
  id: string
  operadorId: string
  operadorNome: string
  setor: string
  maquina: string
  descricao: string
  status: StatusSolicitacao
  prioridade: PrioridadeSolicitacao
  tipoServico: TipoServico
  dataCriacao: string
  dataAtualizacao?: string
  observacoes?: string
}

// --- DADOS MOCK (IMPORTANTE: Mantenha o 'export const') ---

export const operadores: Operador[] = [
  { id: "1", nome: "João Silva", setor: "Fundição", maquina: "Forno 01", maquinaId: "1" },
  { id: "2", nome: "Maria Santos", setor: "Laminação", maquina: "Laminador 03", maquinaId: "6" },
  { id: "3", nome: "Pedro Costa", setor: "Fundição", maquina: "Forno 02", maquinaId: "2" },
  { id: "4", nome: "Ana Oliveira", setor: "Laminação", maquina: "Laminador 01", maquinaId: "4" },
  { id: "5", nome: "Carlos Souza", setor: "Acabamento", maquina: "Serra 02", maquinaId: "8" },
]

export const encarregados: Encarregado[] = [
  { id: "1", nome: "Roberto Almeida", usuario: "roberto.almeida" },
  { id: "2", nome: "Fernanda Lima", usuario: "fernanda.lima" },
]

export const maquinas: Maquina[] = [
  { id: "1", nome: "Forno 01", setor: "Fundição", codigo: "FND-F01" },
  { id: "2", nome: "Forno 02", setor: "Fundição", codigo: "FND-F02" },
  { id: "3", nome: "Forno 03", setor: "Fundição", codigo: "FND-F03" },
  { id: "4", nome: "Laminador 01", setor: "Laminação", codigo: "LAM-L01" },
  { id: "5", nome: "Laminador 02", setor: "Laminação", codigo: "LAM-L02" },
  { id: "6", nome: "Laminador 03", setor: "Laminação", codigo: "LAM-L03" },
  { id: "7", nome: "Serra 01", setor: "Prensas", codigo: "ACB-S01" },
  { id: "8", nome: "Serra 02", setor: "Prensas", codigo: "ACB-S02" },
  { id: "9", nome: "Prensa 01", setor: "Prensas", codigo: "ACB-P01" },
  { id: "10", nome: "Prensa 02", setor: "Prensas", codigo: "ACB-P02" },
  { id: "11", nome: "Extrusora 01", setor: "Extrusão", codigo: "EXT-E01" },
]

export const setores = ["Fundição", "Laminação", "Prensas", "Slitters", "Extrusão"]

export const solicitacoesIniciais: Solicitacao[] = [
  {
    id: "1",
    operadorId: "1",
    operadorNome: "João Silva",
    setor: "Fundição",
    maquina: "Forno 01",
    descricao: "Temperatura do forno não está atingindo o valor programado",
    status: "pendente",
    prioridade: "A",
    tipoServico: "Elétrica",
    dataCriacao: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    operadorId: "2",
    operadorNome: "Maria Santos",
    setor: "Laminação",
    maquina: "Laminador 03",
    descricao: "Ruído anormal no motor principal",
    status: "em_andamento",
    prioridade: "B",
    tipoServico: "Mecânica",
    dataCriacao: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    dataAtualizacao: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    observacoes: "Equipe verificando rolamentos",
  },
  {
    id: "3",
    operadorId: "4",
    operadorNome: "Ana Oliveira",
    setor: "Laminação",
    maquina: "Laminador 01",
    descricao: "Vazamento de óleo hidráulico",
    status: "concluida",
    prioridade: "C",
    tipoServico: "Mecânica",
    dataCriacao: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    dataAtualizacao: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    observacoes: "Substituída mangueira hidráulica. Máquina liberada.",
  },
]