<template>
  <div class="p-2">
    <div v-if="loading" class="text-center py-20">
      <i class="ph-duotone ph-spinner-gap animate-spin text-6xl text-emerald-500"></i>
    </div>
    <div v-else-if="activePedidos.length === 0" class="text-center py-20">
      <i class="ph-duotone ph-coffee text-6xl text-gray-400"></i>
    </div>
    <transition-group v-else name="slide-up" tag="div" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="pedido in activePedidos" :key="pedido.id" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 flex flex-col">
        <div class="flex justify-between items-start mb-3">
          <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100">{{ pedido.mesa_nombre }} - #{{ pedido.id }}</h3>
          <span class="text-lg font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full flex items-center gap-1">
            <i class="ph-duotone ph-timer"></i>
            <span>{{ calculateElapsedTime(pedido.createdAt) }}</span>
          </span>
        </div>
        <ul class="flex-1 border-t border-b border-gray-200 dark:border-gray-700 py-3 my-3 space-y-3">
          <li v-for="detalle in pedido.detalles" :key="detalle.id" class="flex flex-col items-start">
            <div class="flex justify-between w-full">
              <span class="text-gray-700 dark:text-gray-300 font-medium">
                {{ detalle.cantidad }}x {{ detalle.producto ? detalle.producto.nombre : 'Producto no disponible' }}
              </span>
            </div>
            <div v-if="detalle.personalizacion" class="pl-4 mt-1 text-xs w-full">
              <p v-for="extra in (detalle.personalizacion.agregados || [])" :key="extra.nombre" class="text-blue-600 dark:text-blue-400 font-semibold">
                + {{ extra.nombre }}
              </p>
              <p v-for="removido in (detalle.personalizacion.removidos || [])" :key="removido" class="text-red-500 dark:text-red-400 font-semibold">
                - Sin {{ removido }}
              </p>
            </div>
          </li>
        </ul>
        <button @click="updateOrderStatus(pedido.id, 'listo para entregar')" class="w-full mt-4 bg-green-500 text-white font-bold py-2 rounded-lg hover:bg-green-600 transition-colors">
          Pedido Listo
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import apiClient from '../services/api';
import { io } from "socket.io-client";

const pedidos = ref([]);
const loading = ref(true);
const currentTime = ref(new Date());
let timerIntervalId = null;
let socket;

const backendHostname = window.location.hostname || 'localhost';
const backendUrl = `http://${backendHostname}:3000`;

// ===== FUNCIÓN CLAVE =====
// Parsea el campo 'personalizacion' si viene como string
const parsePersonalizacion = (pedidosArray) => {
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
        .filter(p => p && p.estado === 'en preparacion')
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
});

const updateOrderStatus = async (pedidoId, nuevoEstado) => {
    try { 
        await apiClient.patch(`/pedidos/${pedidoId}/estado`, { estado: nuevoEstado });
    } catch (error) {
        console.error("Error al actualizar estado:", error);
    }
};

const calculateElapsedTime = (startTime) => {
    const start = new Date(startTime);
    const elapsed = Math.floor((currentTime.value.getTime() - start.getTime()) / 1000);
    if (isNaN(elapsed) || elapsed < 0) return '00:00';
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
};

onMounted(() => {
    fetchPedidos();
    timerIntervalId = setInterval(() => { currentTime.value = new Date(); }, 1000);
    
    socket = io(backendUrl);
    socket.on("connect", () => console.log("Conectado al servidor de sockets en Cocina:", socket.id));
    
    socket.on("nuevo_pedido", (nuevoPedido) => {
        if (nuevoPedido && nuevoPedido.id) {
            const [parsedPedido] = parsePersonalizacion([nuevoPedido]);
            pedidos.value.unshift(parsedPedido);
        }
    });

    socket.on("pedido_actualizado", (pedidoActualizado) => {
        if (pedidoActualizado && pedidoActualizado.id) {
            const [parsedPedido] = parsePersonalizacion([pedidoActualizado]);
            const index = pedidos.value.findIndex(p => p && p.id === parsedPedido.id);
            if (index !== -1) {
                pedidos.value = pedidos.value.map(p => p.id === parsedPedido.id ? parsedPedido : p);
            } else {
                pedidos.value.unshift(parsedPedido);
            }
        }
    });
});

onBeforeUnmount(() => {
    if (socket) socket.disconnect();
    if (timerIntervalId) clearInterval(timerIntervalId);
});
</script>