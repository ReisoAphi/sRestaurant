<template>
  <div class="max-w-lg mx-auto">
    <CartComponent v-if="cart.items.length > 0 && !cart.consumerOrderId" />
    
    <div v-else>
      <div v-if="loading" class="text-center py-20">
        <i class="ph-duotone ph-spinner-gap animate-spin text-5xl text-emerald-500"></i>
      </div>
      <div v-else-if="!cart.consumerOrderId" class="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <i class="ph-duotone ph-receipt text-6xl text-gray-300 dark:text-gray-600"></i>
        <h2 class="mt-4 text-2xl font-bold text-gray-700 dark:text-gray-200">No tienes un pedido activo</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-2">Una vez que ordenes, podrás ver el estado aquí.</p>
        <router-link to="/" class="mt-6 inline-block bg-emerald-500 text-white font-bold py-2 px-6 rounded-lg">
          Empezar a Ordenar
        </router-link>
      </div>
      <div v-else-if="error" class="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <i class="ph-duotone ph-x-circle text-6xl text-red-400"></i>
        <h2 class="mt-4 text-2xl font-bold text-gray-700 dark:text-gray-200">No se encontró tu pedido</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-2">{{ error }}</p>
        <button @click="startNewOrder" class="mt-6 inline-block bg-gray-600 text-white font-bold py-2 px-6 rounded-lg">
          Limpiar y ordenar de nuevo
        </button>
      </div>
      <div v-else-if="pedido" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div class="text-center border-b dark:border-gray-700 pb-4 mb-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">ID de tu Pedido</p>
          <h2 class="text-3xl font-bold text-emerald-600 dark:text-emerald-400">#{{ pedido.id }}</h2>
        </div>
        <div class="text-center my-8">
          <p class="text-sm text-gray-500 dark:text-gray-400">Estado Actual</p>
          <div class="mt-2 inline-flex items-center gap-3 px-6 py-3 rounded-full text-2xl font-bold" :class="statusInfo.class">
            <i :class="statusInfo.icon"></i>
            <span>{{ statusInfo.text }}</span>
          </div>
        </div>
        <ul class="space-y-2 mb-6">
          <li v-for="detalle in pedido.detalles" :key="detalle.id" class="flex justify-between items-center text-gray-700 dark:text-gray-300">
            <span>{{ detalle.cantidad }}x {{ detalle.producto.nombre }}</span>
            <span class="font-medium">{{ formatCurrency(detalle.cantidad * detalle.precio_unitario) }}</span>
          </li>
        </ul>
        <div class="border-t dark:border-gray-700 pt-4 flex justify-between text-xl font-bold dark:text-gray-100">
          <span>Total:</span>
          <span>{{ formatCurrency(pedido.total) }}</span>
        </div>
        <div v-if="(pedido.estado === 'entregado' && pedido.pagado) || pedido.estado === 'cancelado'" class="text-center mt-8">
          <button @click="startNewOrder" class="bg-emerald-500 text-white font-bold py-2 px-6 rounded-lg">
            Crear un Nuevo Pedido
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import apiClient from '../services/api';
import { io } from "socket.io-client";
import CartComponent from '../components/CartComponent.vue';

const cart = useCartStore();
const router = useRouter();
const pedido = ref(null);
const loading = ref(true);
const error = ref(null);
let socket;

const backendHostname = window.location.hostname || 'localhost';
const backendUrl = `http://${backendHostname}:3000`;

const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0);

const fetchPedido = async () => {
    if (!cart.consumerOrderId) {
        loading.value = false;
        return;
    }
    loading.value = true;
    error.value = null;
    try {
        const response = await apiClient.get(`/pedidos/${cart.consumerOrderId}`);
        pedido.value = response.data;
    } catch (err) {
        console.error("Error fetching order:", err);
        if (err.response && err.response.status === 404) {
            error.value = "No se encontró el pedido. Puede que ya no exista.";
            cart.clearConsumerOrder();
        } else {
            error.value = "No se pudo conectar para verificar tu pedido.";
        }
    } finally {
        loading.value = false;
    }
};

const statusInfo = computed(() => {
    if (!pedido.value) return {};
    if (pedido.value.estado === 'entregado' && pedido.value.pagado) {
         return { text: '¡Buen provecho!', icon: 'ph-duotone ph-check-circle', class: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' };
    }
    switch(pedido.value.estado) {
        case 'en validacion': return { text: 'Validando Pedido', icon: 'ph-duotone ph-question', class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' };
        case 'en preparacion': return { text: 'En preparación', icon: 'ph-duotone ph-fire', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' };
        case 'listo para entregar': return { text: '¡Listo para entregar!', icon: 'ph-duotone ph-bell', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' };
        case 'entregado': return { text: 'Pedido Entregado', icon: 'ph-duotone ph-smiley', class: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' };
        case 'cancelado': return { text: 'Cancelado', icon: 'ph-duotone ph-x-circle', class: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' };
        default: return { text: 'Desconocido', icon: 'ph-duotone ph-question', class: 'bg-gray-100' };
    }
});

const startNewOrder = () => {
    cart.clearConsumerOrder();
    router.push('/');
};

onMounted(() => {
    if (cart.consumerOrderId) {
        fetchPedido();
    } else {
        loading.value = false;
    }
    socket = io(backendUrl);
    socket.on('connect', () => console.log('Socket conectado en Mi Pedido'));
    socket.on('pedido_actualizado', (pedidoActualizado) => {
        if (String(pedidoActualizado.id) === String(cart.consumerOrderId)) {
            pedido.value = pedidoActualizado;
        }
    });
});

watch(() => cart.consumerOrderId, (newId) => { 
    if (newId) {
        fetchPedido();
    } else {
        pedido.value = null;
    }
});

onBeforeUnmount(() => { 
    if (socket) socket.disconnect(); 
});
</script>