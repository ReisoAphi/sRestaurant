<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Gestión de Usuarios</h2>
      <button @click="openModal()" class="bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-600">
        <i class="ph ph-plus"></i>
        Añadir Usuario
      </button>
    </div>

    <div v-if="loading" class="text-center py-10"><i class="ph-duotone ph-spinner-gap animate-spin text-4xl text-emerald-500"></i></div>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th class="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Nombre</th>
            <th class="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Username</th>
            <th class="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Rol</th>
            <th class="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <td class="p-3 text-sm text-gray-700 dark:text-gray-300 font-medium">{{ user.nombre }}</td>
            <td class="p-3 text-sm text-gray-500 dark:text-gray-400">{{ user.username }}</td>
            <td class="p-3 text-sm text-gray-700 dark:text-gray-300 capitalize">{{ user.role }}</td>
            <td class="p-3 text-sm text-right">
              <button @click="openModal(user)" class="text-blue-500 hover:text-blue-700 mr-4">Editar</button>
              <button @click="confirmDelete(user)" class="text-red-500 hover:text-red-700" :disabled="isCurrentUser(user.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-if="isModalOpen" @click.self="closeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
      <h3 class="text-2xl font-bold mb-6 dark:text-gray-100">{{ isEditMode ? 'Editar Usuario' : 'Añadir Usuario' }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label for="nombre" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
          <input v-model="currentUser.nombre" type="text" id="nombre" class="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
        </div>
        <div class="mb-4">
          <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
          <input v-model="currentUser.username" type="text" id="username" class="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
        </div>
        <div class="mb-4">
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
          <input v-model="currentUser.password" type="password" id="password" class="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" :placeholder="isEditMode ? 'Dejar en blanco para no cambiar' : ''" :required="!isEditMode">
        </div>
        <div class="mb-6">
          <label for="role" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Rol</label>
          <select v-model="currentUser.role" id="role" class="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
            <option value="mesero">Mesero</option>
            <option value="cocinero">Cocinero</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>
        <div class="flex justify-end gap-4">
          <button type="button" @click="closeModal" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-lg">Cancelar</button>
          <button type="submit" class="px-4 py-2 bg-emerald-500 text-white rounded-lg">{{ isEditMode ? 'Guardar Cambios' : 'Crear Usuario' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../services/api';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const users = ref([]);
const loading = ref(true);
const isModalOpen = ref(false);
const isEditMode = ref(false);
const currentUser = ref({});

const fetchUsers = async () => {
    try {
        loading.value = true;
        const response = await apiClient.get('/users');
        users.value = response.data;
    } catch (error) {
        console.error("Error al cargar usuarios:", error);
    } finally {
        loading.value = false;
    }
};

const openModal = (user = null) => {
    if (user) {
        isEditMode.value = true;
        currentUser.value = { ...user, password: '' };
    } else {
        isEditMode.value = false;
        currentUser.value = { nombre: '', username: '', password: '', role: 'mesero' };
    }
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
};

const handleSubmit = async () => {
    try {
        const data = { ...currentUser.value };
        if (isEditMode.value && !data.password) {
            delete data.password;
        }

        if (isEditMode.value) {
            await apiClient.put(`/users/${data.id}`, data);
        } else {
            await apiClient.post('/users', data);
        }
        fetchUsers();
        closeModal();
    } catch (error) {
        console.error("Error al guardar usuario:", error);
        alert(error.response?.data?.message || 'No se pudo guardar el usuario.');
    }
};

const confirmDelete = (user) => {
    if (confirm(`¿Estás seguro de que quieres eliminar a ${user.nombre}?`)) {
        deleteUser(user.id);
    }
};

const deleteUser = async (userId) => {
    try {
        await apiClient.delete(`/users/${userId}`);
        fetchUsers();
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        alert(error.response?.data?.message || 'No se pudo eliminar el usuario.');
    }
};

const isCurrentUser = (userId) => {
    return auth.user?.id === userId;
};

onMounted(fetchUsers);
</script>