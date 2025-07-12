// src/stores/config.js
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import apiClient from '../services/api';

export const useConfigStore = defineStore('config', () => {
    const settings = ref({});

    const restaurantName = computed(() => settings.value.restaurant_name || 'Restaurante');

    async function fetchSettings() {
        try {
            const response = await apiClient.get('/settings');
            settings.value = response.data;
        } catch (error) {
            console.error("No se pudo cargar la configuración del sitio:", error);
        }
    }

    return { settings, restaurantName, fetchSettings };
});