<template>
  <div class="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
    <header class="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-3">
            <ph-storefront :size="32" weight="duotone" class="text-emerald-500" />
            <h1 class="text-xl font-semibold text-gray-800 dark:text-gray-100">{{ $route.meta.title || 'Restaurante' }}</h1>
        </div>
        <button @click="themeStore.toggleTheme()" class="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full">
             <ph-moon v-if="themeStore.theme === 'light'" :size="24" weight="duotone" />
             <ph-sun v-else :size="24" weight="duotone" />
        </button>
    </header>

    <main class="flex-1 overflow-y-auto p-4 pb-28">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
    </main>

    <nav class="fixed bottom-0 left-0 right-0 h-20 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg flex justify-around items-center z-10">
        <template v-if="!auth.isAuthenticated">
            <router-link to="/" class="bottom-nav-link flex flex-col items-center text-gray-600 dark:text-gray-300">
                <ph-cooking-pot :size="32" weight="duotone" />
                <span class="text-xs font-medium">Ordenar</span>
            </router-link>
            <router-link to="/mi-pedido" class="bottom-nav-link relative flex flex-col items-center text-gray-600 dark:text-gray-300">
                <span v-if="cart.totalItems > 0" class="absolute top-0 right-1/2 transform translate-x-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {{ cart.totalItems }}
                </span>
                <ph-receipt :size="32" weight="duotone" />
                <span class="text-xs font-medium">Mi Pedido</span>
            </router-link>
            <button @click="auth.openLoginModal()" class="bottom-nav-link flex flex-col items-center text-gray-600 dark:text-gray-300">
                <ph-user-circle :size="32" weight="duotone" />
                <span class="text-xs font-medium">Staff</span>
            </button>
        </template>
        
        <template v-else>
            <router-link v-if="auth.hasRole(['administrador'])" to="/dashboard" class="bottom-nav-link"><ph-gauge :size="32" weight="duotone" /><span class="text-xs font-medium">Dashboard</span></router-link>
            <router-link v-if="auth.hasRole(['administrador'])" to="/menu-admin" class="bottom-nav-link"><ph-list-dashes :size="32" weight="duotone" /><span class="text-xs font-medium">Menú</span></router-link>
            <router-link v-if="auth.hasRole(['administrador'])" to="/users" class="bottom-nav-link"><ph-users-three :size="32" weight="duotone" /><span class="text-xs font-medium">Usuarios</span></router-link>
            <router-link v-if="auth.hasRole(['administrador'])" to="/configuracion" class="bottom-nav-link"><ph-gear :size="32" weight="duotone" /><span class="text-xs font-medium">Config</span></router-link>
            <router-link v-if="auth.hasRole(['mesero', 'administrador'])" to="/mesero" class="bottom-nav-link"><ph-user-list :size="32" weight="duotone" /><span class="text-xs font-medium">Gestionar</span></router-link>
            <router-link v-if="auth.hasRole(['mesero', 'administrador'])" to="/crear-pedido" class="bottom-nav-link"><ph-notepad :size="32" weight="duotone" /><span class="text-xs font-medium">Crear</span></router-link>
            <router-link v-if="auth.hasRole(['mesero', 'administrador'])" to="/ingresar-pedido" class="bottom-nav-link relative">
                <span v-if="cart.totalItems > 0" class="absolute top-0 right-1/2 transform translate-x-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {{ cart.totalItems }}
                </span>
                <ph-arrow-circle-right :size="32" weight="duotone" />
                <span class="text-xs font-medium">Ingresar</span>
            </router-link>
            <router-link v-if="auth.hasRole(['cocinero', 'administrador'])" to="/cocina" class="bottom-nav-link"><ph-fire :size="32" weight="duotone" /><span class="text-xs font-medium">Cocina</span></router-link>
            <router-link v-if="auth.hasRole(['cocinero', 'mesero', 'administrador'])" to="/qrs" class="bottom-nav-link"><ph-qr-code :size="32" weight="duotone" /><span class="text-xs font-medium">QRs</span></router-link>
            <button @click="handleLogout" class="bottom-nav-link">
                <ph-sign-out :size="32" weight="duotone" />
                <span class="text-xs font-medium">Salir</span>
            </button>
        </template>
    </nav>
    <LoginModal />
  </div>
</template>

<script setup>
// El script no tiene cambios
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useCartStore } from './stores/cart';
import { useThemeStore } from './stores/theme';
import LoginModal from './components/LoginModal.vue';
import { 
    PhStorefront, PhMoon, PhSun, PhCookingPot, PhReceipt, PhUserCircle, 
    PhGauge, PhListDashes, PhUsersThree, PhGear, PhUserList, PhNotepad, 
    PhArrowCircleRight, PhFire, PhQrCode, PhSignOut 
} from "phosphor-vue";

const auth = useAuthStore();
const cart = useCartStore();
const themeStore = useThemeStore();
const router = useRouter();

onMounted(() => {
  themeStore.initTheme();
});

const handleLogout = () => {
    auth.logout();
    router.push('/');
};
</script>

<style>
.bottom-nav-link {
  @apply flex flex-col items-center text-gray-600 dark:text-gray-300;
}
.bottom-nav-link.router-link-active {
  color: #10b981;
}
.dark .bottom-nav-link.router-link-active {
  color: #34d399;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>