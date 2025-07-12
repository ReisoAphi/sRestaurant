// src/models/DetallePedido.ts
import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from '../config/database';
import Pedido from './Pedido';
import Producto from './Producto';

class DetallePedido extends Model<InferAttributes<DetallePedido>, InferCreationAttributes<DetallePedido>> {
  declare id: CreationOptional<number>;
  declare cantidad: number;
  declare precio_unitario: number;
  declare personalizacion: { // NUEVO CAMPO
    removidos?: string[]; // Nombres de ingredientes base removidos
    agregados?: { nombre: string; costo_extra: number }[]; // Ingredientes extra añadidos
  } | null;

  // Foreign Keys
  declare pedidoId: ForeignKey<Pedido['id']>;
  declare productoId: ForeignKey<Producto['id']>;
}

DetallePedido.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    // NUEVO CAMPO para guardar las personalizaciones
    personalizacion: {
        type: DataTypes.JSON,
        allowNull: true,
    },
  },
  {
    tableName: 'detalles_pedido',
    sequelize,
    timestamps: false,
  }
);

export default DetallePedido;
