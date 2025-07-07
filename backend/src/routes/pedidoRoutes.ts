//@ts-nocheck
// src/routes/pedidoRoutes.ts
import { Router } from 'express';
import { createPedido, getAllPedidos, getPedidoById, updateEstadoPedido, marcarComoPagado } from '../controllers/pedidoController';
import { verifyToken, checkRole } from '../middleware/authMiddleware';

const router = Router();

// --- RUTAS PÚBLICAS ---
router.post('/', createPedido);
router.get('/:id', getPedidoById);

// --- RUTAS PROTEGIDAS (STAFF) ---
router.get('/', verifyToken, checkRole(['cocinero', 'mesero', 'administrador']), getAllPedidos);

// Ruta para cambiar el estado de entrega o cancelar
router.patch('/:id/estado', verifyToken, checkRole(['cocinero', 'mesero', 'administrador']), updateEstadoPedido);

// NUEVA RUTA: Ruta para marcar como pagado
router.patch('/:id/pagar', verifyToken, checkRole(['mesero', 'administrador']), marcarComoPagado);

export default router;