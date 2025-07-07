// src/models/Producto.ts
import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from '../config/database';
import Categoria from './Categoria';

class Producto extends Model<InferAttributes<Producto>, InferCreationAttributes<Producto>> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare descripcion: string | null;
  declare precio: number;
  declare imagen_url: string | null;
  declare categoriaId: ForeignKey<Categoria['id']>;
}

Producto.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    imagen_url: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    // No definimos 'categoriaId' aquí directamente, Sequelize lo hará por la asociación.
  },
  {
    tableName: 'productos',
    sequelize,
  }
);

export default Producto;