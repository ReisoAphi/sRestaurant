// src/controllers/pedidoController.ts
import { Request, Response } from 'express';
import sequelize from '../config/database';
import { Pedido, DetallePedido, Producto, Ingrediente } from '../models';
import { io } from '../server';

// Interfaces para tipar los datos de entrada
interface PersonalizacionInput {
  removidos?: number[];
  agregados?: number[];
}

interface DetallePedidoInput {
    productoId: number;
    cantidad: number;
    personalizacion?: PersonalizacionInput;
}

interface CreatePedidoBody {
    mesa_nombre?: string;
    detalles: DetallePedidoInput[];
    estado?: 'en validacion' | 'en preparacion';
}

const includeDetalles = {
    model: DetallePedido,
    as: 'detalles',
    attributes: ['id', 'cantidad', 'precio_unitario', 'personalizacion'],
    include: [{
        model: Producto,
        as: 'producto',
        attributes: ['nombre', 'precio']
    }]
};

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

            let precioPersonalizado = parseFloat(producto.precio.toString());
            const personalizacionParaGuardar: { removidos: string[], agregados: { nombre: string, costo_extra: number }[] } = { removidos: [], agregados: [] };

            if(detalle.personalizacion) {
                if (detalle.personalizacion.agregados && detalle.personalizacion.agregados.length > 0) {
                    for (const ingId of detalle.personalizacion.agregados) {
                        const ingrediente = await Ingrediente.findByPk(ingId);
                        if (ingrediente) {
                            precioPersonalizado += parseFloat(ingrediente.costo_extra.toString());
                            personalizacionParaGuardar.agregados.push({ nombre: ingrediente.nombre, costo_extra: ingrediente.costo_extra });
                        }
                    }
                }
                
                if (detalle.personalizacion.removidos && detalle.personalizacion.removidos.length > 0) {
                     for (const ingId of detalle.personalizacion.removidos) {
                        const ingrediente = await Ingrediente.findByPk(ingId);
                        if (ingrediente) {
                           personalizacionParaGuardar.removidos.push(ingrediente.nombre);
                        }
                     }
                }
            }
            
            totalPedido += precioPersonalizado * detalle.cantidad;
            
            detallesParaCrear.push({
                productoId: detalle.productoId,
                cantidad: detalle.cantidad,
                precio_unitario: precioPersonalizado,
                // ===== CORRECCIÓN CLAVE =====
                // Guardamos siempre el objeto, aunque esté vacío, en lugar de null.
                personalizacion: personalizacionParaGuardar,
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
        
        const pedidoCompleto = await Pedido.findByPk(nuevoPedido.id, { include: [includeDetalles] });
        
        io.emit('nuevo_pedido', pedidoCompleto);
        res.status(201).json(pedidoCompleto);
    } catch (error) {
        await t.rollback();
        console.error("Error al crear el pedido:", error);
        res.status(500).json({ message: 'Error al crear el pedido', error });
    }
};

// ... (El resto de las funciones del archivo no necesitan cambios)
export const getAllPedidos = async (req: Request, res: Response) => {
    try {
        const pedidos = await Pedido.findAll({
            include: [includeDetalles],
            order: [['createdAt', 'DESC']]
        });
        res.json(pedidos);
    } catch (error) {
        console.error("Error al obtener todos los pedidos:", error);
        res.status(500).json({ message: 'Error al obtener los pedidos', error });
    }
};

export const getPedidoById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pedido = await Pedido.findByPk(id, {
            include: [includeDetalles]
        });

        if (pedido) {
            res.json(pedido);
        } else {
            res.status(404).json({ message: 'Pedido no encontrado' });
        }
    } catch (error) {
        console.error("Error al obtener el pedido por ID:", error);
        res.status(500).json({ message: 'Error al obtener el pedido', error });
    }
};

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
        const pedidoActualizado = await Pedido.findByPk(id, { include: [includeDetalles] });
        io.emit('pedido_actualizado', pedidoActualizado);
        res.json(pedidoActualizado);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el estado del pedido', error });
    }
};

export const marcarComoPagado = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pedido = await Pedido.findByPk(id);
        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        pedido.pagado = true;
        await pedido.save();
        const pedidoActualizado = await Pedido.findByPk(id, { include: [includeDetalles] });
        io.emit('pedido_actualizado', pedidoActualizado);
        res.json(pedidoActualizado);
    } catch (error) {
        res.status(500).json({ message: 'Error al marcar el pedido como pagado', error });
    }
};

export const addItemsToPedido = async (req: Request, res: Response) => {
    const { id } = req.params;
    const t = await sequelize.transaction();
    try {
        const { detalles }: { detalles: DetallePedidoInput[] } = req.body;
        if (!detalles || detalles.length === 0) { return res.status(400).json({ message: 'Se debe proporcionar al menos un producto para añadir.' }); }
        const pedido = await Pedido.findByPk(id, { transaction: t });
        if (!pedido) { await t.rollback(); return res.status(404).json({ message: 'Pedido no encontrado.' }); }
        if (pedido.pagado) { await t.rollback(); return res.status(403).json({ message: 'No se pueden añadir productos a un pedido que ya ha sido pagado.' }); }
        let totalAdicional = 0;
        const detallesParaCrear = [];
        for (const detalle of detalles) {
            const producto = await Producto.findByPk(detalle.productoId);
            if (!producto) { await t.rollback(); return res.status(404).json({ message: `Producto con ID ${detalle.productoId} no encontrado.` }); }
            const precioUnitario = producto.precio;
            totalAdicional += parseFloat(producto.precio.toString()) * detalle.cantidad;
            detallesParaCrear.push({ productoId: detalle.productoId, cantidad: detalle.cantidad, precio_unitario: precioUnitario, pedidoId: pedido.id });
        }
        await DetallePedido.bulkCreate(detallesParaCrear, { transaction: t });
        pedido.total = parseFloat(pedido.total.toString()) + totalAdicional;
        await pedido.save({ transaction: t });
        await t.commit();
        const pedidoCompleto = await Pedido.findByPk(id, { include: [includeDetalles] });
        io.emit('pedido_actualizado', pedidoCompleto);
        res.status(200).json(pedidoCompleto);
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: 'Error al añadir productos al pedido', error });
    }
};