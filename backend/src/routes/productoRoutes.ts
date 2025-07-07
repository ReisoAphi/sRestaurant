//@ts-nocheck
// src/routes/productoRoutes.ts
import { Router } from 'express';
import { getAllProductos, getProductoById, createProducto, updateProducto, deleteProducto } from '../controllers/productoController';
import { verifyToken, checkRole } from '../middleware/authMiddleware';

const router = Router();

// --- RUTAS PÚBLICAS ---
// Cualquiera puede ver el menú de productos.
router.get('/', getAllProductos);
router.get('/:id', getProductoById);

// --- RUTAS PROTEGIDAS ---
// Solo los administradores pueden crear, actualizar o eliminar productos.
router.post('/', verifyToken, checkRole(['administrador']), createProducto);
router.put('/:id', verifyToken, checkRole(['administrador']), updateProducto);
router.delete('/:id', verifyToken, checkRole(['administrador']), deleteProducto);

export default router;