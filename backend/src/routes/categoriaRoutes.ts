//@ts-nocheck
// src/routes/categoriaRoutes.ts
import { Router } from 'express';
import { getAllCategorias, createCategoria } from '../controllers/categoriaController';

const router = Router();

router.get('/', getAllCategorias);
router.post('/', createCategoria);

export default router;