// src/controllers/pedidoController.ts
import { Request, Response } from 'express';
import sequelize from '../config/database';
import { Pedido, DetallePedido, Producto } from '../models';
import { io } from '../server';

interface DetallePedidoInput {
    productoId: number;
    cantidad: number;
}

interface CreatePedidoBody {
    mesa_nombre?: string;
    detalles: DetallePedidoInput[];
    estado?: 'en validacion' | 'en preparacion';
}

// Crear un nuevo pedido
export const createPedido = async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    try {
        const { mesa_nombre, detalles, estado }: CreatePedidoBody = req.body;
        if (!detalles || detalles.length === 0) {
            return res.status(400).json({ message: 'El pedido debe tener al menos un producto.' });
        }
        let totalPedido = 0;
        const detallesParaCrear = [];
        for (const detalle of detalles) {
            const producto = await Producto.findByPk(detalle.productoId);
            if (!producto) {
                await t.rollback();
                return res.status(404).json({ message: `Producto con ID ${detalle.productoId} no encontrado.` });
            }
            const precioUnitario = producto.precio;
            totalPedido += precioUnitario * detalle.cantidad;
            detallesParaCrear.push({
                productoId: detalle.productoId,
                cantidad: detalle.cantidad,
                precio_unitario: precioUnitario
            });
        }
        const nuevoPedido = await Pedido.create({
            mesa_nombre: mesa_nombre || 'Cliente',
            total: totalPedido,
            estado: estado || 'en validacion',
            pagado: false
        }, { transaction: t });
        const detallesConPedidoId = detallesParaCrear.map(d => ({ ...d, pedidoId: nuevoPedido.id }));
        await DetallePedido.bulkCreate(detallesConPedidoId, { transaction: t });
        await t.commit();
        const pedidoCompleto = await Pedido.findByPk(nuevoPedido.id, {
            include: [{ model: DetallePedido, as: 'detalles', include: [{ model: Producto, as: 'producto', attributes: ['nombre'] }] }]
        });
        io.emit('nuevo_pedido', pedidoCompleto);
        res.status(201).json(pedidoCompleto);
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: 'Error al crear el pedido', error });
    }
};

// Actualizar el estado del pedido (validar, preparar, entregar, cancelar)
export const updateEstadoPedido = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        const validStates = ['en preparacion', 'listo para entregar', 'entregado', 'cancelado'];
        if (!estado || !validStates.includes(estado)) {
            return res.status(400).json({ message: "Transición de estado no válida." });
        }
        const pedido = await Pedido.findByPk(id);
        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        pedido.estado = estado;
        await pedido.save();
        const pedidoActualizado = await Pedido.findByPk(id, {
             include: [{ model: DetallePedido, as: 'detalles', include: [{ model: Producto, as: 'producto', attributes: ['nombre'] }] }]
        });
        io.emit('pedido_actualizado', pedidoActualizado);
        res.json(pedidoActualizado);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el estado del pedido', error });
    }
};

// NUEVA FUNCIÓN: Marcar un pedido como pagado
export const marcarComoPagado = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pedido = await Pedido.findByPk(id);
        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        pedido.pagado = true;
        await pedido.save();
        const pedidoActualizado = await Pedido.findByPk(id, {
             include: [{ model: DetallePedido, as: 'detalles', include: [{ model: Producto, as: 'producto', attributes: ['nombre'] }] }]
        });
        io.emit('pedido_actualizado', pedidoActualizado);
        res.json(pedidoActualizado);
    } catch (error) {
        res.status(500).json({ message: 'Error al marcar el pedido como pagado', error });
    }
};

export const getAllPedidos = async (req: Request, res: Response) => { /* ...código sin cambios... */ };
export const getPedidoById = async (req: Request, res: Response) => { /* ...código sin cambios... */ };
