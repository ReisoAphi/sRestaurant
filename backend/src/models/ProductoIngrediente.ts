// src/models/ProductoIngrediente.ts
import { Model, DataTypes, ForeignKey } from 'sequelize';
import sequelize from '../config/database';
import Producto from './Producto';
import Ingrediente from './Ingrediente';

class ProductoIngrediente extends Model {
  declare productoId: ForeignKey<Producto['id']>;
  declare ingredienteId: ForeignKey<Ingrediente['id']>;
}

ProductoIngrediente.init({
  productoId: {
    type: DataTypes.INTEGER.UNSIGNED,
    references: {
      model: Producto,
      key: 'id'
    },
    primaryKey: true
  },
  ingredienteId: {
    type: DataTypes.INTEGER.UNSIGNED,
    references: {
      model: Ingrediente,
      key: 'id'
    },
    primaryKey: true
  }
}, {
  tableName: 'producto_ingredientes',
  sequelize,
  timestamps: false
});

export default ProductoIngrediente;