// lib/api.service.ts

const API_URL = "http://localhost:3001/api";

export interface SolicitacaoDTO {
  operadorId: string;
  operadorNome: string;
  setor: string;
  maquina: string;
  descricao: string;
  prioridade: string;
  tipoServico: string;
  status?: string;
}

export const ApiService = {
  // Buscar todas as solicitações
  async getAll() {
    try {
      const response = await fetch(`${API_URL}/solicitacoes`, { cache: 'no-store' });
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
  }
};