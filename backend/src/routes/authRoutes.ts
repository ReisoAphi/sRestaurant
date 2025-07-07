//@ts-nocheck
import { Router } from 'express';
import { login } from '../controllers/authController'; // Se elimina 'register'

const router = Router();

// La ruta de registro se ha movido a userRoutes y ahora es una acción de administrador
// router.post('/register', register); 

// La ruta de login sigue siendo pública
router.post('/login', login);

export default router;