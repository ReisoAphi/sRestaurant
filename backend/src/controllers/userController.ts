//@ts-nocheck

import { Request, Response } from 'express';
import { Usuario } from '../models';
import { Op } from 'sequelize';

// Obtener todos los usuarios (sin incluir contraseñas)
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await Usuario.findAll({
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los usuarios', error });
    }
};

// Crear un nuevo usuario (similar al registro anterior)
export const createUser = async (req: Request, res: Response) => {
    try {
        const { nombre, username, password, role } = req.body;
        if (!nombre || !username || !password || !role) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }
        const newUser = await Usuario.create({ nombre, username, password, role });
        const userResponse = newUser.toJSON();
        delete userResponse?.password; // No devolver la contraseña
        res.status(201).json(userResponse);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el usuario', error });
    }
};

// Actualizar un usuario
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, username, role, password } = req.body;

        const user = await Usuario.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        user.nombre = nombre || user.nombre;
        user.username = username || user.username;
        user.role = role || user.role;

        // Si se proporciona una nueva contraseña, se actualiza.
        // El hook 'beforeSave' se encargará de encriptarla.
        if (password) {
            user.password = password;
        }

        await user.save();
        const userResponse = user.toJSON();
        delete userResponse.password;
        res.json(userResponse);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el usuario', error });
    }
};

// Eliminar un usuario
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await Usuario.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Prevenir que un admin se elimine a sí mismo
        // @ts-ignore
        if (user.id === req.user?.id) {
            return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta de administrador.' });
        }

        await user.destroy();
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el usuario', error });
    }
};