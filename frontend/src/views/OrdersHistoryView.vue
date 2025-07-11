<!-- src/views/OrdersHistoryView.vue -->
<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">Historial de Pedidos</h2>
      <button @click="fetchPedidos" class="text-emerald-500 hover:text-emerald-700">
        <ph-arrow-clockwise :size="24" />
      </button>
    </div>
    <div v-if="loading" class="text-center py-10">
      <i class="ph-duotone ph-spinner-gap animate-spin text-4xl text-emerald-500"></i>
    </div>
    <div v-else-if="pedidos.length === 0" class="text-center py-10">
      <i class="ph-duotone ph-archive text-5xl text-gray-400"></i>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Aún no hay pedidos registrados.</p>
    </div>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th class="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">ID</th>
            <th class="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Mesa/Cliente</th>
            <th class="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Fecha</th>
            <th class="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Total</th>
            <th class="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Estado</th>
            <th class="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Pago</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="pedido in pedidos" :key="pedido.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <td class="p-3 text-sm text-gray-700 dark:text-gray-300">#{{ pedido.id }}</td>
            <td class="p-3 text-sm text-gray-700 dark:text-gray-300 font-medium">{{ pedido.mesa_nombre }}</td>
            <td class="p-3 text-sm text-gray-500 dark:text-gray-400">{{ formatDateTime(pedido.createdAt) }}</td>
            <td class="p-3 text-sm text-gray-800 dark:text-gray-100 font-bold">{{ formatCurrency(pedido.total) }}</td>
            <td class="p-3 text-sm">
              <span :class="getStatusClass(pedido.estado)" class="px-2 py-1 rounded-full text-xs font-medium capitalize">{{ pedido.estado.replace('_', ' ') }}</span>
            </td>
            <td class="p-3 text-sm">
              <span v-if="pedido.pagado" class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Pagado</span>
              <span v-else class="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">Pendiente</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../services/api';
import { PhArrowClockwise } from "phosphor-vue";

const pedidos = ref([]);
const loading = ref(true);

const fetchPedidos = async () => {
    try {
        loading.value = true;
        const response = await apiClient.get('/pedidos');
        pedidos.value = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
        console.error("Error cargando pedidos:", error);
    } finally {
        loading.value = false;
    }
};

const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0);
const formatDateTime = (dateString) => new Date(dateString).toLocaleString('es-MX');

const getStatusClass = (estado) => {
    const classes = {
        'en validacion': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        'en preparacion': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        'listo para entregar': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        'entregado': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
        'cancelado': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
    };
    return classes[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
};

onMounted(fetchPedidos);
</script>
