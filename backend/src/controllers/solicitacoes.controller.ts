import { Request, Response } from "express";
import { SolicitacoesService } from "../services/solicitacoes.service";

export const SolicitacoesController = {
  async getAll(req: Request, res: Response) {
    try {
      const data = await SolicitacoesService.getAll();
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: "Erro ao listar" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const data = await SolicitacoesService.getById(req.params.id);
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: "Erro ao buscar ID" });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const result = await SolicitacoesService.create(req.body);
      res.json(result);
    } catch (e: any) {
      console.error("ERRO REAL DO FIREBIRD:", e);
      res.status(500).json({ error: e.message || e.toString() });
    }
  },

  async update(req: Request, res: Response) {
    try {
      await SolicitacoesService.update(req.params.id, req.body);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: "Erro ao atualizar" });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      await SolicitacoesService.delete(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: "Erro ao excluir" });
    }
  },
};
