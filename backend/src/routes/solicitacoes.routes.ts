import { Router } from "express";
import { SolicitacoesController } from "../controllers/solicitacoes.controller";

const router = Router();

router.get("/", SolicitacoesController.getAll);
router.get("/:id", SolicitacoesController.getById);
router.post("/", SolicitacoesController.create);
router.put("/:id", SolicitacoesController.update);
router.delete("/:id", SolicitacoesController.delete);

export default router;
