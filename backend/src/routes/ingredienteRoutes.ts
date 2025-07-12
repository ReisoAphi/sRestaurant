// src/routes/ingredienteRoutes.ts
import { Router } from 'express';
import { getAllIngredientes, createIngrediente, updateIngrediente, deleteIngrediente } from '../controllers/ingredienteController';
import { verifyToken, checkRole } from '../middleware/authMiddleware';

const router = Router();

// ===== CORRECCIÓN AQUÍ =====
// La ruta GET ahora es pública para que los clientes puedan ver los ingredientes
router.get('/', getAllIngredientes);

// Las rutas para modificar ingredientes siguen protegidas para el admin
router.post('/', verifyToken, checkRole(['administrador']), createIngrediente);
router.put('/:id', verifyToken, checkRole(['administrador']), updateIngrediente);
router.delete('/:id', verifyToken, checkRole(['administrador']), deleteIngrediente);

export default router;