// src/controllers/categoriaController.ts
import { Request, Response } from 'express';
import { Categoria } from '../models';

// Obtener solo las categorías visibles (para el público)
export const getAllCategorias = async (req: Request, res: Response) => {
  try {
    const categorias = await Categoria.findAll({
        where: { visible: true },
        order: [['nombre', 'ASC']]
    });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las categorías', error });
  }
};

// Obtener TODAS las categorías (para el admin)
export const adminGetAllCategorias = async (req: Request, res: Response) => {
  try {
    const categorias = await Categoria.findAll({
        order: [['nombre', 'ASC']]
    });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las categorías para el admin', error });
  }
};

// Crear una nueva categoría
export const createCategoria = async (req: Request, res: Response) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }
    const nuevaCategoria = await Categoria.create({
      nombre,
      visible: false
    });
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la categoría', error });
  }
};

// Actualizar una categoría
export const updateCategoria = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        const categoria = await Categoria.findByPk(id);
        if (!categoria) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        categoria.nombre = nombre;
        await categoria.save();
        res.json(categoria);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la categoría', error });
    }
};

// Borrado lógico (ocultar)
export const deleteCategoria = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const categoria = await Categoria.findByPk(id);
        if (!categoria) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        categoria.visible = false;
        await categoria.save();
        res.json({ message: 'Categoría ocultada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al ocultar la categoría', error });
    }
};

// Restaurar una categoría (hacer visible)
export const restoreCategoria = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const categoria = await Categoria.findByPk(id);
        if (!categoria) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        categoria.visible = true;
        await categoria.save();
        res.json({ message: 'Categoría restaurada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al restaurar la categoría', error });
    }
};
