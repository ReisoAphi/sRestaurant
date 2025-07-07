// src/controllers/categoriaController.ts
import { Request, Response, NextFunction } from 'express';
import { Categoria } from '../models';

export const getAllCategorias = async (req: Request, res: Response) => {
  try {
    const categorias = await Categoria.findAll({
        include: 'productos' // Incluye los productos asociados
    });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las categorías', error });
  }
};

export const createCategoria = async (req: Request, res: Response) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }
    const nuevaCategoria = await Categoria.create({ nombre });
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la categoría', error });
  }
};