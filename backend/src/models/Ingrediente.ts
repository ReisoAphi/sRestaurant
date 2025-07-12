// backend/src/models/Ingrediente.ts
import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database';

class Ingrediente extends Model<InferAttributes<Ingrediente>, InferCreationAttributes<Ingrediente>> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare costo_extra: number; // Costo si el ingrediente es añadido como extra
}

Ingrediente.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: new DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    costo_extra: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
  },
  {
    tableName: 'ingredientes',
    sequelize,
    timestamps: false,
  }
);

export default Ingrediente;