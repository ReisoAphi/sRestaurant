import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

import { testConnection } from './config/database';
import { syncDatabase } from './models';

// Importar rutas
import authRoutes from './routes/authRoutes';
import categoriaRoutes from './routes/categoriaRoutes';
import productoRoutes from './routes/productoRoutes';
import pedidoRoutes from './routes/pedidoRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import userRoutes from './routes/userRoutes';

// --- INICIALIZACIÓN ---
dotenv.config();
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
  }
});

const PORT = process.env.PORT || 80;

// --- MIDDLEWARE ---
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());


// --- RUTAS DE LA API (Deben ir primero) ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/pedidos', pedidoRoutes);

// --- CÓDIGO DEL PORTAL CAUTIVO AÑADIDO ---
const frontendDistPath = path.join(__dirname, '..', '..', 'frontend', 'dist');

// Estas rutas deben ir ANTES de servir los archivos estáticos.
// Responden a las peticiones de prueba de conectividad de los SO móviles
// para forzar la apertura de la ventana de "Sign In".
import { Request, Response } from 'express';

const servePortal = (req: Request, res: Response) => {
  console.log(`Portal Cautivo: Petición de ${req.originalUrl}. Sirviendo index.html.`);
  res.sendFile(path.join(frontendDistPath, 'index.html'));
};

app.get('/generate_204', servePortal);        // Android
app.get('/hotspot-detect.html', servePortal); // Apple
app.get('/ncsi.txt', servePortal);            // Microsoft

// --- RUTAS DE ARCHIVOS ESTÁTICOS ---
// Sirve todo desde la carpeta 'dist'
app.use(express.static(frontendDistPath));

// La ruta catch-all sirve el index.html para cualquier otra petición y para el router de tu frontend.
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// --- LÓGICA DE SOCKET.IO ---
io.on('connection', (socket) => {
  console.log(`✅ Cliente conectado: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });
});

// --- FUNCIÓN PRINCIPAL DE ARRANQUE ---
const startServer = async () => {
  await testConnection();
  await syncDatabase();

  httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
};

// Arrancar el servidor
startServer();

// Exportamos 'io' para poder usarlo en nuestros controladores
export { io };