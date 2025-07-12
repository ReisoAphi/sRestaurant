<template>
  <div class="p-4 max-w-2xl mx-auto">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">Configuración General</h2>
      <p class="text-gray-500 dark:text-gray-400 mb-6">Ajusta los detalles principales de tu restaurante.</p>
      
      <form @submit.prevent="handleSave" class="space-y-4">
        <div>
          <label for="restaurant_name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Restaurante</label>
          <input v-model="form.restaurant_name" type="text" id="restaurant_name" class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 dark:text-white" placeholder="El nombre de tu negocio" required>
        </div>

        <div class="flex justify-end pt-4">
          <button type="submit" :disabled="isSaving" class="bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-600 disabled:opacity-50">
            <span v-if="isSaving">Guardando...</span>
            <span v-else>Guardar Configuración</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useConfigStore } from '../stores/config';
import apiClient from '../services/api';

const configStore = useConfigStore();
const form = ref({
    restaurant_name: ''
});
const isSaving = ref(false);

onMounted(() => {
    // Asegurarse de que la configuración esté cargada antes de llenar el formulario
    if (!configStore.settings.restaurant_name) {
        configStore.fetchSettings().then(() => {
            form.value.restaurant_name = configStore.settings.restaurant_name || '';
        });
    } else {
        form.value.restaurant_name = configStore.settings.restaurant_name;
    }
});

const handleSave = async () => {
    isSaving.value = true;
    try {
        await apiClient.put('/settings', form.value);
        // Volver a cargar la configuración en la tienda para que se actualice en toda la app
        await configStore.fetchSettings();
        alert('¡Configuración guardada!');
    } catch(error) {
        alert('No se pudo guardar la configuración.');
        console.error(error);
    } finally {
        isSaving.value = false;
    }
};
</script>