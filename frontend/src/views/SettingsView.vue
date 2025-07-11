<template>
  <div class="p-4 max-w-2xl mx-auto">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">Configuración de Conexión</h2>
      <p class="text-gray-500 dark:text-gray-400 mb-6">Define los datos para que los clientes se conecten a la red y al menú.</p>
      
      <form @submit.prevent="handleSave" class="space-y-4">
        <div>
          <label for="ssid" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de la Red (SSID)</label>
          <input v-model="form.ssid" type="text" id="ssid" class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 dark:text-white" placeholder="NombreDeTuWiFi" required>
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña de la Red</label>
          <input v-model="form.password" type="password" id="password" class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 dark:text-white" placeholder="Contraseña">
        </div>

        <div class="border-t dark:border-gray-700 pt-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">URL del Menú para Clientes</label>
          <p class="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded-md mt-1 break-all">{{ webUrl }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Este es el enlace que se usará para el código QR del menú.</p>
        </div>

        <div class="flex justify-end pt-4">
          <button type="submit" class="bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-600">
            Guardar Configuración
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useSettingsStore } from '../stores/settings';

const settingsStore = useSettingsStore();
const form = ref({
    ssid: settingsStore.ssid,
    password: settingsStore.password
});
const webUrl = `http://${window.location.hostname}:3000`;

const handleSave = () => {
    settingsStore.saveSettings(form.value.ssid, form.value.password);
    alert('¡Configuración guardada!');
};
</script>