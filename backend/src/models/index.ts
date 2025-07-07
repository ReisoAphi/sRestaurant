// src/models/index.ts
import sequelize from '../config/database';
import Categoria from './Categoria';
import Producto from './Producto';
import Pedido from './Pedido';
import DetallePedido from './DetallePedido';
import Usuario from './Usuario';

// --- DEFINIR ASOCIACIONES ---
Categoria.hasMany(Producto, { foreignKey: 'categoriaId', as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'categoriaId', as: 'categoria' });

Pedido.hasMany(DetallePedido, { foreignKey: 'pedidoId', as: 'detalles' });
DetallePedido.belongsTo(Pedido, { foreignKey: 'pedidoId', as: 'pedido' });

Producto.hasMany(DetallePedido, { foreignKey: 'productoId', as: 'en_pedidos' });
DetallePedido.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });


// Función para sincronizar los modelos y crear admin por defecto
export const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados con la base de datos.');

    // --- LÓGICA PARA CREAR ADMIN POR DEFECTO ---
    const { count } = await Usuario.findAndCountAll({ where: { role: 'administrador' } });

    if (count === 0) {
      console.log('No se encontraron administradores, creando usuario por defecto...');
      await Usuario.create({
        nombre: 'Administrador Principal',
        username: 'admin',
        password: 'admin', // La contraseña se encriptará automáticamente por el hook del modelo
        role: 'administrador',
      });
      console.log('✅ Usuario administrador por defecto creado con éxito (usuario: admin, contraseña: admin).');
    }
    // --- FIN DE LA LÓGICA ---

  } catch (error) {
    console.error('❌ No se pudieron sincronizar los modelos o crear el admin:', error);
  }
};

// Exportamos todos los modelos
export { Categoria, Producto, Pedido, DetallePedido, Usuario };
