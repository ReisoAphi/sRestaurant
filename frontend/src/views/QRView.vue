<!-- src/views/QRView.vue -->
<template>
  <div class="p-4 space-y-8 max-w-4xl mx-auto">
    <div v-if="settings.ssid" class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- QR para Conexión WiFi -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">QR para Conexión WiFi</h3>
        <canvas ref="wifiCanvas"></canvas>
      </div>
      <!-- QR para Abrir el Menú -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">QR para Abrir el Menú</h3>
        <canvas ref="urlCanvas"></canvas>
        <p class="text-gray-600 dark:text-gray-300 mt-4 break-all">
          Apunta a: <strong class="text-emerald-600 dark:text-emerald-400">{{ webUrl }}</strong>
        </p>
      </div>
    </div>
    <!-- Mensaje si no hay configuración -->
    <div v-else class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
      <i class="ph-duotone ph-wifi-slash text-6xl text-amber-500"></i>
      <h2 class="mt-4 text-2xl font-bold text-gray-700 dark:text-gray-200">Sin Configuración</h2>
      <p class="text-gray-500 dark:text-gray-400 mt-2">
        Un administrador necesita configurar el nombre y la contraseña de la red WiFi en la pestaña de "Configuración" para poder generar los códigos QR.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useSettingsStore } from '../stores/settings';
import QRCode from 'qrcode';

const settings = useSettingsStore();
const wifiCanvas = ref(null);
const urlCanvas = ref(null);
const webUrl = `http://${window.location.hostname}:3000`;

const generateQRCodes = () => {
  nextTick(() => {
    // Generar QR de WiFi solo si hay un SSID configurado
    if (settings.ssid && wifiCanvas.value) {
      const wifiString = `WIFI:S:${settings.ssid};T:WPA;P:${settings.password};;`;
      QRCode.toCanvas(wifiCanvas.value, wifiString, { width: 256, margin: 2 }, (error) => {
        if (error) console.error('Error generando QR de WiFi:', error);
      });
    }

    // Generar QR de URL
    if (urlCanvas.value) {
      QRCode.toCanvas(urlCanvas.value, webUrl, { width: 256, margin: 2 }, (error) => {
        if (error) console.error('Error generando QR de URL:', error);
      });
    }
  });
};

// Genera los códigos cuando el componente se monta
onMounted(generateQRCodes);

// Y también los regenera si los ajustes cambian
watch(() => [settings.ssid, settings.password], generateQRCodes);
</script>
