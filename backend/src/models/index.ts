// src/models/index.ts (REEMPLAZAR ARCHIVO COMPLETO)
import sequelize from '../config/database';
import Categoria from './Categoria';
import Producto from './Producto';
import Pedido from './Pedido';
import DetallePedido from './DetallePedido';
import Usuario from './Usuario';
import Ingrediente from './Ingrediente';
import ProductoIngrediente from './ProductoIngrediente';
import Setting from './Setting'; // <-- NUEVA IMPORTACIÓN

// --- DEFINIR ASOCIACIONES ---
// (asociaciones existentes)
Categoria.hasMany(Producto, { foreignKey: 'categoriaId', as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'categoriaId', as: 'categoria' });
Pedido.hasMany(DetallePedido, { foreignKey: 'pedidoId', as: 'detalles' });
DetallePedido.belongsTo(Pedido, { foreignKey: 'pedidoId', as: 'pedido' });
Producto.hasMany(DetallePedido, { foreignKey: 'productoId', as: 'en_pedidos' });
DetallePedido.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });
Producto.belongsToMany(Ingrediente, { through: ProductoIngrediente, foreignKey: 'productoId', otherKey: 'ingredienteId', as: 'ingredientes'});
Ingrediente.belongsToMany(Producto, { through: ProductoIngrediente, foreignKey: 'ingredienteId', otherKey: 'productoId', as: 'productos'});

// Función para sincronizar los modelos y crear datos por defecto
export const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados con la base de datos.');

    // Crear admin por defecto si no existe
    const adminCount = await Usuario.count({ where: { role: 'administrador' } });
    if (adminCount === 0) {
      console.log('Creando usuario administrador por defecto...');
      await Usuario.create({
        nombre: 'Administrador Principal',
        username: 'admin',
        password: 'admin',
        role: 'administrador',
      });
      console.log('✅ Usuario administrador por defecto creado.');
    }

    // ===== CORRECCIÓN AQUÍ: Crear configuración inicial si no existe =====
    const settingCount = await Setting.count({ where: { key: 'restaurant_name' } });
    if (settingCount === 0) {
        console.log('Creando configuración inicial del restaurante...');
        await Setting.create({
            key: 'restaurant_name',
            value: 'Mi Restaurante'
        });
        console.log('✅ Configuración inicial creada.');
    }

  } catch (error) {
    console.error('❌ No se pudieron sincronizar los modelos o crear datos iniciales:', error);
  }
};

export { Categoria, Producto, Pedido, DetallePedido, Usuario, Ingrediente, ProductoIngrediente, Setting }; // <-- EXPORTAR NUEVO MODELO