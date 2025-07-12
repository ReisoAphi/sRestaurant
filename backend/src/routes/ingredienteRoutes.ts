// backend/src/routes/ingredienteRoutes.ts
import { Router } from 'express';
import { getAllIngredientes, createIngrediente, updateIngrediente, deleteIngrediente } from '../controllers/ingredienteController';
import { verifyToken, checkRole } from '../middleware/authMiddleware';

const router = Router();

// Todas las rutas de gestión de ingredientes requieren ser administrador
router.use(verifyToken, checkRole(['administrador']));

router.get('/', getAllIngredientes);
router.post('/', createIngrediente);
router.put('/:id', updateIngrediente);
router.delete('/:id', deleteIngrediente);

export default router;