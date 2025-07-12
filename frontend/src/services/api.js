// src/services/api.js

import axios from 'axios';
import { useAuthStore } from '../stores/auth';

// 1. Configuración dinámica de la URL del backend
const backendHostname = window.location.hostname || 'localhost';
const backendUrl = `http://${backendHostname}:3000`;

// 2. Creación de la instancia de Axios
const apiClient = axios.create({
    baseURL: `${backendUrl}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 3. Interceptor de peticiones (Añade el token a cada petición)
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ===== CORRECCIÓN CLAVE: Interceptor de Respuestas =====
// Este bloque se ejecuta DESPUÉS de que el servidor responde.
apiClient.interceptors.response.use(
    // Si la respuesta es exitosa (código 2xx), simplemente la devuelve.
    (response) => response,
    
    // Si la respuesta es un error...
    (error) => {
        // Verificamos si el error es un 401 (No autorizado)
        if (error.response && error.response.status === 401) {
            const auth = useAuthStore();
            console.error("Error 401: No autorizado. Cerrando sesión.");
            
            // Llama a la función de logout para limpiar el estado y localStorage
            auth.logout();

            // Redirige al usuario a la página de inicio.
            // Usamos window.location para asegurar una recarga completa.
            window.location.href = '/'; 
        }
        
        // Para cualquier otro error, simplemente lo devolvemos para que sea manejado localmente.
        return Promise.reject(error);
    }
);


export default apiClient;