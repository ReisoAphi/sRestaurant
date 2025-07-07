// src/controllers/authController.ts
import { Request, Response } from 'express';
import { Usuario } from '../models';
import jwt from 'jsonwebtoken';

// Función para generar un token JWT
const generateToken = (id: number, role: string) => {
  const secret = process.env.JWT_SECRET || 'tu_secreto_por_defecto';
  return jwt.sign({ id, role }, secret, { expiresIn: '8h' });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { nombre, username, password, role } = req.body;
    const nuevoUsuario = await Usuario.create({ nombre, username, password, role });
    res.status(201).json({
      id: nuevoUsuario.id,
      nombre: nuevoUsuario.nombre,
      username: nuevoUsuario.username,
      role: nuevoUsuario.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el usuario', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const usuario = await Usuario.findOne({ where: { username } });

    if (!usuario || !(await usuario.comparePassword(password))) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = generateToken(usuario.id, usuario.role);

    res.json({
      token,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        username: usuario.username,
        role: usuario.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error });
  }
};
