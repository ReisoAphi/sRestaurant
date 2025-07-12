// src/controllers/productoController.ts
import { Request, Response } from 'express';
import { Producto, Categoria, Ingrediente, ProductoIngrediente } from '../models';
import sequelize from '../config/database';

// Opciones de inclusión para reutilizar en las consultas
const includeIngredients = {
  model: Ingrediente,
  as: 'ingredientes',
  attributes: ['id', 'nombre', 'costo_extra'],
  through: { attributes: [] }
};

const includeCategoria = {
    model: Categoria,
    as: 'categoria',
    attributes: ['id', 'nombre', 'visible']
};

// Obtener solo productos visibles (para el público)
export const getAllProductos = async (req: Request, res: Response) => {
  try {
    const productos = await Producto.findAll({
      where: { visible: true },
      include: [
        { ...includeCategoria, where: { visible: true }, required: true },
        includeIngredients
      ],
      order: [['nombre', 'ASC']]
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
      include: [includeCategoria, includeIngredients],
      order: [['nombre', 'ASC']]
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos para el admin', error });
  }
};

// Crear un nuevo producto
export const createProducto = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { nombre, precio, categoriaId, descripcion, ingredientes } = req.body;
    
    if (!nombre || !precio || !categoriaId) {
      await t.rollback();
      return res.status(400).json({ message: 'Nombre, precio y categoriaId son requeridos' });
    }
    
    const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;

    const nuevoProducto = await Producto.create({ nombre, precio, categoriaId, descripcion, imagen_url, visible: true }, { transaction: t });

    let ingredientesIds = [];
    if (ingredientes) {
        ingredientesIds = typeof ingredientes === 'string' ? JSON.parse(ingredientes) : ingredientes;
        if (!Array.isArray(ingredientesIds)) ingredientesIds = [];
    }

    if (ingredientesIds.length > 0) {
      const asociaciones = ingredientesIds.map(ingId => ({
        productoId: nuevoProducto.id,
        ingredienteId: ingId
      }));
      await ProductoIngrediente.bulkCreate(asociaciones, { transaction: t });
    }

    await t.commit();
    
    const productoCompleto = await Producto.findByPk(nuevoProducto.id, { include: [includeCategoria, includeIngredients] });
    res.status(201).json(productoCompleto);
  } catch (error) {
    await t.rollback();
    console.error("Error al crear el producto:", error);
    res.status(500).json({ message: 'Error al crear el producto', error });
  }
};

// Actualizar un producto
export const updateProducto = async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const producto = await Producto.findByPk(id);

        if (!producto) {
            await t.rollback();
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        
        const { ingredientes, ...updateData } = req.body;

        if (req.file) {
            updateData.imagen_url = `/uploads/${req.file.filename}`;
        }
        
        await producto.update(updateData, { transaction: t });

        if (ingredientes !== undefined) {
            let ingredientesIds = typeof ingredientes === 'string' ? JSON.parse(ingredientes) : ingredientes;
            if (!Array.isArray(ingredientesIds)) ingredientesIds = [];

            // Borrar asociaciones antiguas y crear las nuevas
            await ProductoIngrediente.destroy({ where: { productoId: producto.id }, transaction: t });
            
            if (ingredientesIds.length > 0) {
              //@ts-ignore
                const asociaciones = ingredientesIds.map(ingId => ({
                    productoId: producto.id,
                    ingredienteId: ingId
                }));
                await ProductoIngrediente.bulkCreate(asociaciones, { transaction: t });
            }
        }

        await t.commit();
        
        const productoCompleto = await Producto.findByPk(id, { include: [includeCategoria, includeIngredients] });
        res.json(productoCompleto);
    } catch (error) {
        await t.rollback();
        console.error("Error al actualizar el producto:", error);
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