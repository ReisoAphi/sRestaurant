// src/stores/auth.js

import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import apiClient from '../services/api';

// La función se define y se exporta.
export const useAuthStore = defineStore('auth', () => {
    const user = ref(JSON.parse(localStorage.getItem('user')) || null);
    const token = ref(localStorage.getItem('token') || null);
    const isLoginModalOpen = ref(false);

    const isAuthenticated = computed(() => !!token.value);
    
    function openLoginModal() { isLoginModalOpen.value = true; }
    function closeLoginModal() { isLoginModalOpen.value = false; }

    async function login(credentials) {
        const response = await apiClient.post('/auth/login', credentials);
        const { token: newToken, user: userData } = response.data;
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        token.value = newToken;
        user.value = userData;
        closeLoginModal();

        // Devuelve la ruta para que el componente navegue
        if (userData.role === 'administrador') return '/dashboard';
        if (userData.role === 'mesero') return '/mesero';
        if (userData.role === 'cocinero') return '/cocina';
        return '/';
    }

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        token.value = null;
        user.value = null;
    }
    
    function hasRole(roles) {
        if (!user.value || !user.value.role) return false;
        return roles.includes(user.value.role);
    }

    return { user, token, isAuthenticated, isLoginModalOpen, openLoginModal, closeLoginModal, login, logout, hasRole };
});