// src/models/Usuario.ts
import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

// Definimos los roles permitidos en la aplicación
export type UserRole = 'consumidor' | 'cocinero' | 'mesero' | 'administrador';

class Usuario extends Model<InferAttributes<Usuario>, InferCreationAttributes<Usuario>> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare username: string;
  declare password: string;
  declare role: UserRole;

  // Método para comparar contraseñas
  public async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

Usuario.init(
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
    username: {
      type: new DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    password: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('consumidor', 'cocinero', 'mesero', 'administrador'),
      allowNull: false,
      defaultValue: 'consumidor',
    },
  },
  {
    tableName: 'usuarios',
    sequelize,
    hooks: {
      // Hook para encriptar la contraseña antes de crear o actualizar un usuario
      beforeSave: async (usuario) => {
        if (usuario.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          usuario.password = await bcrypt.hash(usuario.password, salt);
        }
      },
    },
  }
);

export default Usuario;