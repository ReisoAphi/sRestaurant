// src/main.js

import { createApp } from 'vue';
import { createPinia } from 'pinia'; // Importa la función para crear Pinia

import App from './App.vue';
import router from './router';
// import './assets/tailwind-output.css'; // Asegúrate de que esta ruta sea correcta
import './style.css';

// 1. Crea la instancia de la aplicación
const app = createApp(App);

// 2. Instala Pinia en la aplicación. Esto es CRÍTICO.
//    Ahora, todos los componentes descendientes de App podrán usar las stores.
app.use(createPinia());

// 3. Instala el Router.
app.use(router);

// 4. Monta la aplicación en el DOM.
app.mount('#app');

// NO AÑADAS EL router.beforeEach AQUÍ POR AHORA.
// Primero haremos que la app funcione.