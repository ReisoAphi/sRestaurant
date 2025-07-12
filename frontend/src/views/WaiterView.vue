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
      <OrderCard v-for="pedido in activePedidos" :key="pedido.id + '-' + pedido.estado + '-' + pedido.updatedAt" :order="pedido" @order-updated="fetchPedidos" />
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

const parsePersonalizacion = (pedidosArray) => {
  if (!Array.isArray(pedidosArray)) return [];
  return pedidosArray.map(pedido => {
    if (pedido && Array.isArray(pedido.detalles)) {
      pedido.detalles.forEach(detalle => {
        if (detalle && typeof detalle.personalizacion === 'string') {
          try {
            detalle.personalizacion = JSON.parse(detalle.personalizacion);
          } catch (e) {
            console.error("Error al parsear la personalización:", e);
            detalle.personalizacion = null;
          }
        }
      });
    }
    return pedido;
  });
};

const fetchPedidos = async () => {
    try {
        loading.value = true;
        const response = await apiClient.get('/pedidos');
        pedidos.value = parsePersonalizacion(response.data.filter(p => p && p.id));
    } catch (error) {
        console.error("Error cargando pedidos:", error);
    } finally {
        loading.value = false;
    }
};

const activePedidos = computed(() => {
    return pedidos.value
      .filter(p => {
          if (!p || typeof p.estado === 'undefined' || typeof p.pagado === 'undefined') return false;
          const isCompleted = p.estado === 'entregado' && p.pagado === true;
          const isCancelled = p.estado === 'cancelado';
          return !isCompleted && !isCancelled;
      })
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
});

onMounted(() => {
    fetchPedidos();
    socket = io(backendUrl);
    socket.on("connect", () => console.log("Conectado al servidor de sockets en Mesero:", socket.id));
    
    socket.on("nuevo_pedido", (nuevoPedido) => {
        if (nuevoPedido && nuevoPedido.id) {
            const [parsedPedido] = parsePersonalizacion([nuevoPedido]);
            pedidos.value.unshift(parsedPedido);
        }
    });

    socket.on("pedido_actualizado", (pedidoActualizado) => {
        if (pedidoActualizado && pedidoActualizado.id) {
            fetchPedidos(); // La forma más simple de asegurar consistencia es recargar toda la lista.
        }
    });
});

onBeforeUnmount(() => {
    if (socket) socket.disconnect();
});
</script>