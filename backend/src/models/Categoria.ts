// src/models/Categoria.ts
import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database';

class Categoria extends Model<InferAttributes<Categoria>, InferCreationAttributes<Categoria>> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare visible: boolean; // NUEVO CAMPO
}

Categoria.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: new DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    // NUEVO CAMPO para borrado lógico (soft delete)
    visible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    }
  },
  {
    tableName: 'categorias',
    sequelize,
    timestamps: false,
  }
);

export default Categoria;
