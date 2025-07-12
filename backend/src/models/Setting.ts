// src/models/Setting.ts
import { Model, DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../config/database';

class Setting extends Model<InferAttributes<Setting>, InferCreationAttributes<Setting>> {
  declare key: string;
  declare value: string;
}

Setting.init(
  {
    key: {
      type: new DataTypes.STRING(128),
      primaryKey: true,
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'settings',
    sequelize,
    timestamps: false,
  }
);

export default Setting;