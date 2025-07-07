//@ts-nocheck
// src/routes/categoriaRoutes.ts
import { Router } from 'express';
import { getAllCategorias, createCategoria, updateCategoria, deleteCategoria } from '../controllers/categoriaController';
import { verifyToken, checkRole } from '../middleware/authMiddleware';

const router = Router();

// Ruta pública para obtener todas las categorías
router.get('/', getAllCategorias);

// Rutas protegidas para que solo los administradores puedan gestionar categorías
router.post('/', verifyToken, checkRole(['administrador']), createCategoria);
router.put('/:id', verifyToken, checkRole(['administrador']), updateCategoria);
router.delete('/:id', verifyToken, checkRole(['administrador']), deleteCategoria);

export default router;
