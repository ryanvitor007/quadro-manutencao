// backend/src/controllers/maquinas.controller.ts
import { Request, Response } from "express";
import { MaquinasService } from "../services/maquinas.service";

export const MaquinasController = {
  async buscarPorCodigo(req: Request, res: Response) {
    try {
      const { codigo } = req.query; // Pega ?codigo=XYZ
      
      if (!codigo) {
        return res.status(400).json({ message: "Código QR necessário." });
      }

      const maquina = await MaquinasService.getByCodigo(String(codigo));

      if (maquina) {
        res.json(maquina);
      } else {
        res.status(404).json({ message: "Máquina não encontrada." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar máquina." });
    }
  },

  async listar(req: Request, res: Response) {
    try {
      const maquinas = await MaquinasService.getAll();
      res.json(maquinas);
    } catch (error) {
      res.status(500).json({ error: "Erro ao listar máquinas" });
    }
  },

  async criar(req: Request, res: Response) {
    try {
      await MaquinasService.create(req.body);
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar máquina" });
    }
  }
};