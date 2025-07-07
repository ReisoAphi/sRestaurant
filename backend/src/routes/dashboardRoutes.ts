//@ts-nocheck
import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { verifyToken, checkRole } from '../middleware/authMiddleware';

const router = Router();

// Protegemos la ruta para que solo los administradores puedan ver las estadísticas
router.get('/', verifyToken, checkRole(['administrador']), getDashboardStats);

export default router;
