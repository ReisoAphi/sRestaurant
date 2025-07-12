// src/routes/settingRoutes.ts
import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingController';
import { verifyToken, checkRole } from '../middleware/authMiddleware';

const router = Router();

// Ruta pública para que cualquiera pueda obtener el nombre del restaurante
router.get('/', getSettings);

// Ruta protegida para que solo el admin pueda actualizar la configuración
router.put('/', verifyToken, checkRole(['administrador']), updateSettings);

export default router;