// src/controllers/categoriaController.ts
import { Request, Response } from 'express';
import { Categoria, Producto } from '../models';

// Obtener todas las categorías
export const getAllCategorias = async (req: Request, res: Response) => {
  try {
    const categorias = await Categoria.findAll({
        include: 'productos',
        order: [['nombre', 'ASC']]
    });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las categorías', error });
  }
};

// Crear una nueva categoría
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

// Actualizar una categoría existente
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

// Eliminar una categoría
export const deleteCategoria = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const categoria = await Categoria.findByPk(id);
        if (!categoria) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        // Prevenir la eliminación si la categoría tiene productos asociados
        const productCount = await Producto.count({ where: { categoriaId: id } });
        if (productCount > 0) {
            return res.status(400).json({ message: `No se puede eliminar. ${productCount} producto(s) pertenecen a esta categoría.` });
        }
        await categoria.destroy();
        res.json({ message: 'Categoría eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la categoría', error });
    }
};
