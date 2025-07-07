// src/models/Pedido.ts
import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database';

// CORRECCIÓN: Se actualiza la lista de estados. 'pagado' se convierte en un campo booleano.
type PedidoEstado = 'en validacion' | 'en preparacion' | 'listo para entregar' | 'entregado' | 'cancelado';

class Pedido extends Model<InferAttributes<Pedido>, InferCreationAttributes<Pedido>> {
  declare id: CreationOptional<number>;
  declare mesa_nombre: string;
  declare total: number;
  declare estado: PedidoEstado;
  declare pagado: boolean; // NUEVO CAMPO
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Pedido.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    mesa_nombre: {
      type: new DataTypes.STRING(128),
      allowNull: false,
      defaultValue: 'Cliente',
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('en validacion', 'en preparacion', 'listo para entregar', 'entregado', 'cancelado'),
      allowNull: false,
      defaultValue: 'en validacion',
    },
    // NUEVO CAMPO: Para manejar el pago de forma independiente al estado de entrega.
    pagado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: 'pedidos',
    sequelize,
  }
);

export default Pedido;