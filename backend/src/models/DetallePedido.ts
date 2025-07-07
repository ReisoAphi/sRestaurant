// src/models/DetallePedido.ts
import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from '../config/database';
import Pedido from './Pedido';
import Producto from './Producto';

class DetallePedido extends Model<InferAttributes<DetallePedido>, InferCreationAttributes<DetallePedido>> {
  declare id: CreationOptional<number>;
  declare cantidad: number;
  declare precio_unitario: number;

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
  },
  {
    tableName: 'detalles_pedido',
    sequelize,
    timestamps: false,
  }
);

export default DetallePedido;
