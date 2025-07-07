//@ts-nocheck
// src/routes/productoRoutes.ts
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getAllProductos, adminGetAllProductos, createProducto, updateProducto, deleteProducto, restoreProducto } from '../controllers/productoController';
import { verifyToken, checkRole } from '../middleware/authMiddleware';

const router = Router();

// --- Configuración de Multer ---
const uploadDir = 'public/uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- RUTAS PÚBLICAS ---
router.get('/', getAllProductos);

// --- RUTAS DE ADMINISTRADOR ---
const adminRouter = Router();
adminRouter.use(verifyToken, checkRole(['administrador']));

adminRouter.get('/all', adminGetAllProductos);
adminRouter.post('/', upload.single('imagen'), createProducto);
adminRouter.put('/:id', upload.single('imagen'), updateProducto);
adminRouter.delete('/:id', deleteProducto); // Soft delete
adminRouter.patch('/:id/restore', restoreProducto); // Restore

router.use('/admin', adminRouter);

export default router;
