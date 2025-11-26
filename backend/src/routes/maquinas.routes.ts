// backend/src/routes/maquinas.routes.ts
import { Router } from "express";
import { MaquinasController } from "../controllers/maquinas.controller";

const router = Router();

router.get("/buscar", MaquinasController.buscarPorCodigo); // GET /api/maquinas/buscar?codigo=XXX
router.get("/", MaquinasController.listar);
router.post("/", MaquinasController.criar);

export default router;