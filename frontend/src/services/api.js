// src/services/api.js

import axios from 'axios';

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

// 3. El interceptor de peticiones (¡La pieza clave!)
apiClient.interceptors.request.use(
    (config) => {
        // Obtiene el token del localStorage en cada petición
        const token = localStorage.getItem('token');
        if (token) {
            // Si el token existe, lo añade a la cabecera de autorización
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Maneja errores en la petición
        return Promise.reject(error);
    }
);

export default apiClient;