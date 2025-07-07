import { Request, Response } from 'express';
import { Pedido, DetallePedido, Producto } from '../models';
import { Op, fn, col, literal } from 'sequelize';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const today = new Date();
        const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));

        // 1. Ventas totales históricas (solo pedidos pagados)
        const totalSales = await Pedido.sum('total', { where: { estado: 'pagado' } });

        // 2. Pedidos realizados hoy
        const todayOrdersCount = await Pedido.count({
            where: { createdAt: { [Op.gte]: startOfDay } }
        });

        // 3. Ventas de hoy (solo pedidos pagados de hoy)
        const todaySales = await Pedido.sum('total', {
            where: {
                estado: 'pagado',
                createdAt: { [Op.gte]: startOfDay }
            }
        });

        // 4. Productos más vendidos (Top 5)
        const topSellingProducts = await DetallePedido.findAll({
            attributes: [
                [fn('SUM', col('cantidad')), 'totalVendido']
            ],
            include: [{
                model: Producto,
                as: 'producto',
                attributes: ['nombre']
            }],
            group: ['productoId', 'producto.id'],
            order: [[literal('totalVendido'), 'DESC']],
            limit: 5
        });
        
        // 5. Ventas de los últimos 7 días para el gráfico
        const salesLast7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(new Date(date).setHours(23, 59, 59, 999));

            const dailySale = await Pedido.sum('total', {
                where: {
                    estado: 'pagado',
                    createdAt: { [Op.between]: [dayStart, dayEnd] }
                }
            });

            salesLast7Days.push({
                date: dayStart.toLocaleDateString('es-MX', { weekday: 'short' }),
                total: dailySale || 0
            });
        }

        res.json({
            totalSales: totalSales || 0,
            todayOrdersCount: todayOrdersCount || 0,
            todaySales: todaySales || 0,
            topSellingProducts,
            salesLast7Days
        });

    } catch (error) {
        console.error("Error al obtener las estadísticas del dashboard:", error);
        res.status(500).json({ message: 'Error al obtener las estadísticas' });
    }
};
