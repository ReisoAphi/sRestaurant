// backend/src/controllers/ingredienteController.ts
import { Request, Response } from 'express';
import { Ingrediente } from '../models';

export const getAllIngredientes = async (req: Request, res: Response) => {
    try {
        const ingredientes = await Ingrediente.findAll({ order: [['nombre', 'ASC']] });
        res.json(ingredientes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener ingredientes', error });
    }
};

export const createIngrediente = async (req: Request, res: Response) => {
    try {
        const { nombre, costo_extra } = req.body;
        const nuevoIngrediente = await Ingrediente.create({ nombre, costo_extra });
        res.status(201).json(nuevoIngrediente);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el ingrediente', error });
    }
};

export const updateIngrediente = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, costo_extra } = req.body;
        const ingrediente = await Ingrediente.findByPk(id);
        if (!ingrediente) return res.status(404).json({ message: 'Ingrediente no encontrado' });
        
        await ingrediente.update({ nombre, costo_extra });
        res.json(ingrediente);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el ingrediente', error });
    }
};

export const deleteIngrediente = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const ingrediente = await Ingrediente.findByPk(id);
        if (!ingrediente) return res.status(404).json({ message: 'Ingrediente no encontrado' });

        await ingrediente.destroy();
        res.json({ message: 'Ingrediente eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el ingrediente', error });
    }
};