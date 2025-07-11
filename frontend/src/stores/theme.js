// src/stores/theme.js
import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', () => {
    // 1. El estado (la variable que guarda 'light' o 'dark')
    const theme = ref(localStorage.getItem('theme') || 'light');

    // 2. La función que actualiza el HTML
    function updateHtmlClass() {
        if (theme.value === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    // 3. La acción que el botón llamará para cambiar el tema
    function toggleTheme() {
        theme.value = theme.value === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', theme.value);
        updateHtmlClass();
    }
    
    // 4. La función para inicializar el tema al cargar la app
    function initTheme() {
        const storedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (storedTheme) {
            theme.value = storedTheme;
        } else {
            theme.value = systemPrefersDark ? 'dark' : 'light';
        }
        updateHtmlClass();
    }

    // 5. Devuelve todo para que los componentes puedan usarlo
    return { theme, toggleTheme, initTheme };
});