// lib/api.service.ts

const API_URL = "http://localhost:3001/api";

// Definição do DTO para solicitações
export interface SolicitacaoDTO {
  operadorId: string;
  operadorNome: string;
  setor: string;
  maquina: string;
  descricao: string;
  prioridade: string;
  tipoServico: string;
  status?: string;
  criadoPorQr?: boolean;
  responsavelTecnico?: string;
}

// Serviço para interagir com a API de solicitações
export const ApiService = {
  // Método de Login
  async login(tipo: "operador" | "encarregado", login: string, senha?: string) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, login, senha }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erro no login");
      return data;
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  },

  // Buscar máquina pelo código do QR
  async getMaquinaByCodigo(codigo: string) {
    try {
      // Chama a rota que criámos: /api/maquinas/buscar?codigo=...
      const response = await fetch(
        `${API_URL}/maquinas/buscar?codigo=${codigo}`
      );

      if (!response.ok) {
        if (response.status === 404) throw new Error("Máquina não encontrada");
        throw new Error("Erro ao buscar máquina");
      }

      return await response.json();
    } catch (error) {
      console.error("Erro no scanner:", error);
      throw error;
    }
  },

  // Opcional: Para listar no painel de gestão
  async getTodasMaquinas() {
    const response = await fetch(`${API_URL}/maquinas`);
    return await response.json();
  },
  //  <-- Fim do código de máquinas -->

  // Buscar todas as solicitações
  async getAll() {
    try {
      const response = await fetch(`${API_URL}/solicitacoes`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Erro ao buscar dados");
      return await response.json();
    } catch (error) {
      console.error("Erro na API (getAll):", error);
      return [];
    }
  },

  // Criar nova solicitação
  async create(data: SolicitacaoDTO) {
    try {
      const response = await fetch(`${API_URL}/solicitacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao salvar");
      return await response.json();
    } catch (error) {
      console.error("Erro na API (create):", error);
      throw error;
    }
  },

  // Atualizar status
  async update(id: string, data: { status?: string; observacoes?: string }) {
    try {
      const response = await fetch(`${API_URL}/solicitacoes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao atualizar");
      return await response.json();
    } catch (error) {
      console.error("Erro na API (update):", error);
      throw error;
    }
  },
};
