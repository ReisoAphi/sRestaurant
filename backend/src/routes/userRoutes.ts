//@ts-nocheck
import { Router } from 'express';
import { getAllUsers, createUser, updateUser, deleteUser } from '../controllers/userController';
import { verifyToken, checkRole } from '../middleware/authMiddleware';

const router = Router();

// Todas las rutas de gestión de usuarios requieren ser administrador
router.use(verifyToken, checkRole(['administrador']));

router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
