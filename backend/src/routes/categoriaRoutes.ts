//@ts-nocheck
// src/routes/categoriaRoutes.ts
import { Router } from 'express';
import { getAllCategorias, adminGetAllCategorias, createCategoria, updateCategoria, deleteCategoria, restoreCategoria } from '../controllers/categoriaController';
import { verifyToken, checkRole } from '../middleware/authMiddleware';

const router = Router();

// Ruta pública para obtener solo las categorías visibles para los clientes
router.get('/', getAllCategorias);

// --- RUTAS DE ADMINISTRADOR ---

// Ruta para que el admin obtenga TODAS las categorías (visibles y ocultas)
router.get('/admin/all', verifyToken, checkRole(['administrador']), adminGetAllCategorias);

// Ruta para crear una nueva categoría
router.post('/', verifyToken, checkRole(['administrador']), createCategoria);

// Ruta para actualizar una categoría por ID
router.put('/:id', verifyToken, checkRole(['administrador']), updateCategoria);

// Ruta para el borrado lógico (ocultar) de una categoría
router.delete('/:id', verifyToken, checkRole(['administrador']), deleteCategoria);

// Ruta para restaurar (hacer visible) una categoría
router.patch('/:id/restore', verifyToken, checkRole(['administrador']), restoreCategoria);

export default router;
