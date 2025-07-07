// src/controllers/productoController.ts
import { Request, Response } from 'express';
import { Producto, Categoria } from '../models';
import { Model } from 'sequelize';

// Obtener todos los productos, incluyendo su categoría
export const getAllProductos = async (req: Request, res: Response) => {
  try {
    const productos = await Producto.findAll({
      include: {
        model: Categoria,
        as: 'categoria', // Este alias debe coincidir con el definido en la asociación
        attributes: ['id', 'nombre'], // Solo trae estos atributos de la categoría
      },
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos', error });
  }
};

// Obtener un producto por su ID
export const getProductoById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const producto = await Producto.findByPk(id, {
            include: {
                model: Categoria,
                as: 'categoria',
            }
        });

        if (producto) {
            res.json(producto);
        } else {
            res.status(404).json({ message: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el producto', error });
    }
};

// Crear un nuevo producto
export const createProducto = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion, precio, categoriaId } = req.body;
    
    // Validación básica
    if (!nombre || !precio || !categoriaId) {
      return res.status(400).json({ message: 'Nombre, precio y categoriaId son requeridos' });
    }

    const nuevoProducto = await Producto.create(req.body);
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

        await producto.update(req.body);
        res.json(producto);

    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el producto', error });
    }
};

// Eliminar un producto
export const deleteProducto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const producto = await Producto.findByPk(id);

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        await producto.destroy();
        res.json({ message: 'Producto eliminado correctamente' });

    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el producto', error });
    }
};
