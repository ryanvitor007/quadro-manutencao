import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export const AuthController = {
  async login(req: Request, res: Response) {
    try {
      const { tipo, login, senha } = req.body;
      
      // Validação básica
      if (!tipo || !login) {
        return res.status(400).json({ ok: false, message: "Dados incompletos" });
      }

      const result = await AuthService.login(tipo, login, senha);
      
      if (result.ok) {
        res.json(result);
      } else {
        res.status(401).json(result); // 401 = Não autorizado
      }
    } catch (e: any) {
      console.error("Erro no login:", e);
      res.status(500).json({ ok: false, message: "Erro interno no servidor" });
    }
  }
};