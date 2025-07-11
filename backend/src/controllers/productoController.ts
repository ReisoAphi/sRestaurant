// src/controllers/productoController.ts
import { Request, Response } from 'express';
import { Producto, Categoria } from '../models';
import { Op } from 'sequelize';

// Obtener solo productos visibles (para el público)
export const getAllProductos = async (req: Request, res: Response) => {
  try {
    const productos = await Producto.findAll({
      where: { visible: true },
      include: {
        model: Categoria,
        as: 'categoria',
        where: { visible: true },
        required: true
      },
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos', error });
  }
};

// Obtener TODOS los productos (para el admin)
export const adminGetAllProductos = async (req: Request, res: Response) => {
  try {
    const productos = await Producto.findAll({
      include: {
        model: Categoria,
        as: 'categoria',
        attributes: ['id', 'nombre', 'visible']
      },
      order: [['nombre', 'ASC']]
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos para el admin', error });
  }
};

// Crear un nuevo producto
export const createProducto = async (req: Request, res: Response) => {
  try {
    const { nombre, precio, categoriaId } = req.body;
    if (!nombre || !precio || !categoriaId) {
      return res.status(400).json({ message: 'Nombre, precio y categoriaId son requeridos' });
    }
    let imagen_url = req.file ? `${req.protocol}://${req.get('host')}/public/uploads/${req.file.filename}` : null;
    const nuevoProducto = await Producto.create({ ...req.body, imagen_url });
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el producto', error });
  }
};

// Actualizar un producto
export const updateProducto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const producto = await Producto.findByPk(id);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        const updateData = { ...req.body };
        if (req.file) {
            updateData.imagen_url = `${req.protocol}://${req.get('host')}/public/uploads/${req.file.filename}`;
        }
        await producto.update(updateData);
        res.json(producto);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el producto', error });
    }
};

// Borrado lógico (ocultar)
export const deleteProducto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const producto = await Producto.findByPk(id);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        producto.visible = false;
        await producto.save();
        res.json({ message: 'Producto ocultado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al ocultar el producto', error });
    }
};

// Restaurar un producto (hacer visible)
export const restoreProducto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const producto = await Producto.findByPk(id);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        producto.visible = true;
        await producto.save();
        res.json({ message: 'Producto restaurado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al restaurar el producto', error });
    }
};
