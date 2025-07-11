<template>
  <div class="p-2 relative">
    <div v-if="loading" class="text-center py-20">
      <i class="ph-duotone ph-spinner-gap animate-spin text-6xl text-emerald-500"></i>
      <p class="mt-4 text-xl text-gray-600 dark:text-gray-400">Cargando pedidos...</p>
    </div>
    <div v-else-if="activePedidos.length === 0" class="text-center py-20">
      <i class="ph-duotone ph-coffee text-6xl text-gray-400"></i>
      <p class="mt-4 text-xl text-gray-600 dark:text-gray-400">No hay pedidos por gestionar.</p>
    </div>
    <transition-group v-else name="slide-up" tag="div" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <OrderCard v-for="pedido in activePedidos" :key="pedido.id" :order="pedido" @order-updated="handleOrderUpdate" />
    </transition-group>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { io } from "socket.io-client";
import apiClient from '../services/api';
import OrderCard from '../components/OrderCard.vue';

const pedidos = ref([]);
const loading = ref(true);
let socket;

const backendHostname = window.location.hostname || 'localhost';
const backendUrl = `http://${backendHostname}:3000`;

const fetchPedidos = async () => {
    try {
        loading.value = true;
        const response = await apiClient.get('/pedidos');
        pedidos.value = response.data;
    } catch (error) {
        console.error("Error cargando pedidos:", error);
    } finally {
        loading.value = false;
    }
};

const activePedidos = computed(() => {
    return pedidos.value
      .filter(p => {
          const isCompleted = p.estado === 'entregado' && p.pagado === true;
          const isCancelled = p.estado === 'cancelado';
          return !isCompleted && !isCancelled;
      })
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
});

const handleOrderUpdate = (updatedOrder) => {
    const index = pedidos.value.findIndex(p => p.id === updatedOrder.id);
    if (index !== -1) {
        pedidos.value.splice(index, 1, updatedOrder);
    }
};

onMounted(() => {
    fetchPedidos();
    socket = io(backendUrl);
    socket.on("connect", () => console.log("Conectado al servidor de sockets en Mesero:", socket.id));
    socket.on("nuevo_pedido", (nuevoPedido) => {
        pedidos.value.unshift(nuevoPedido);
    });
    socket.on("pedido_actualizado", (pedidoActualizado) => {
        const index = pedidos.value.findIndex(p => p.id === pedidoActualizado.id);
        if (index !== -1) {
            pedidos.value.splice(index, 1, pedidoActualizado);
        } else {
            pedidos.value.unshift(pedidoActualizado);
        }
    });
});

onBeforeUnmount(() => {
    if (socket) socket.disconnect();
});
</script>