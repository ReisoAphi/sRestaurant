//@ts-nocheck
// src/routes/pedidoRoutes.ts
import { Router } from 'express';
import { createPedido, getAllPedidos, getPedidoById, updateEstadoPedido, marcarComoPagado, addItemsToPedido } from '../controllers/pedidoController';
import { verifyToken, checkRole } from '../middleware/authMiddleware';

const router = Router();

// --- RUTAS PÚBLICAS ---
router.post('/', createPedido);
router.get('/:id', getPedidoById);

// --- RUTAS PROTEGIDAS (STAFF) ---
router.get('/', verifyToken, checkRole(['cocinero', 'mesero', 'administrador']), getAllPedidos);

// **NUEVA RUTA**: Añadir items a un pedido existente. Solo meseros y administradores.
router.post('/:id/add-items', verifyToken, checkRole(['mesero', 'administrador']), addItemsToPedido);

// Ruta para cambiar el estado de entrega o cancelar
router.patch('/:id/estado', verifyToken, checkRole(['cocinero', 'mesero', 'administrador']), updateEstadoPedido);

// Ruta para marcar como pagado
router.patch('/:id/pagar', verifyToken, checkRole(['mesero', 'administrador']), marcarComoPagado);

export default router;