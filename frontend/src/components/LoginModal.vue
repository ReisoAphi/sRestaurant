<template>
  <div v-if="auth.isLoginModalOpen" @click.self="auth.closeLoginModal()" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 relative">
      <button @click="auth.closeLoginModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
        <i class="ph ph-x text-2xl"></i>
      </button>
      <div class="text-center mb-8">
        <i class="ph-duotone ph-storefront text-6xl text-emerald-500"></i>
        <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">Acceso Staff</h1>
        <p class="text-gray-500 dark:text-gray-400">Inicia sesión para continuar</p>
      </div>
      <form @submit.prevent="handleLogin">
        <div v-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{{ error }}</p>
        </div>
        <div class="mb-4">
          <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Usuario</label>
          <input v-model="username" type="text" id="username" class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" required>
        </div>
        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
          <input v-model="password" type="password" id="password" class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" required>
        </div>
        <button type="submit" :disabled="loading" class="w-full py-3 px-4 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center">
          <i v-if="loading" class="ph-duotone ph-spinner-gap animate-spin text-2xl mr-2"></i>
          <span>{{ loading ? 'Ingresando...' : 'Ingresar' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router'; // Importa el router aquí

const auth = useAuthStore();
const router = useRouter(); // Obtén la instancia del router
const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref(null);

const handleLogin = async () => {
    loading.value = true;
    error.value = null;
    try {
        // La función login ahora devuelve la ruta a la que debemos ir
        const redirectPath = await auth.login({ username: username.value, password: password.value });
        // El componente se encarga de la navegación
        router.push(redirectPath);
    } catch (err) {
        error.value = err.response?.data?.message || 'Error al iniciar sesión. Inténtalo de nuevo.';
    } finally {
        loading.value = false;
    }
};
</script>