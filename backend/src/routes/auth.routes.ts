// backend/src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

// Define a rota POST /login
router.post('/login', AuthController.login);

export default router;