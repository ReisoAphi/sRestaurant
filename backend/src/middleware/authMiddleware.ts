// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/Usuario';

// Extendemos la interfaz Request de Express para incluir la propiedad 'user'
interface AuthRequest extends Request {
  user?: {
    id: number;
    role: UserRole;
  };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'tu_secreto_por_defecto';
    const decoded = jwt.verify(token, secret) as { id: number; role: UserRole };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Token inválido.' });
  }
};

export const checkRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permiso para realizar esta acción.' });
    }
    next();
  };
};