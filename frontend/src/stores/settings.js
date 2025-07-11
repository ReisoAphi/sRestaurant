// src/stores/settings.js
import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', () => {
    const ssid = ref(localStorage.getItem('wifiSSID') || '');
    const password = ref(localStorage.getItem('wifiPassword') || '');

    function saveSettings(newSsid, newPassword) {
        ssid.value = newSsid;
        password.value = newPassword;
        localStorage.setItem('wifiSSID', newSsid);
        localStorage.setItem('wifiPassword', newPassword);
    }

    return { ssid, password, saveSettings };
});