<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 flex flex-col" :class="getCardBorder(localOrder.estado)">
    <div class="flex justify-between items-start mb-3">
        <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100">{{ localOrder.mesa_nombre }} - #{{ localOrder.id }}</h3>
        <span class="text-lg font-bold flex items-center gap-1" :class="getStatusColor(localOrder.estado)">
            <i class="ph-duotone ph-timer"></i>
            <span>{{ calculateElapsedTime(localOrder.createdAt) }}</span>
        </span>
    </div>
    <p class="mb-3 font-semibold capitalize" :class="getStatusColor(localOrder.estado)">Estado: {{ getStatusText(localOrder.estado) }}</p>
    <ul class="flex-1 border-t border-b border-gray-200 dark:border-gray-700 py-3 my-3 space-y-2">
        <li v-for="detalle in localOrder.detalles" :key="detalle.id" class="flex justify-between items-center">
          <span class="text-gray-700 dark:text-gray-300">{{ detalle.producto.nombre }}</span>
          <span class="font-bold text-emerald-600 dark:text-emerald-400">x {{ detalle.cantidad }}</span>
        </li>
    </ul>
    
    <div v-if="!localOrder.pagado" class="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
        <div class="flex justify-between items-center text-lg font-bold text-gray-800 dark:text-gray-100">
            <span>Total a Cobrar:</span>
            <span>{{ formatCurrency(localOrder.total) }}</span>
        </div>
    </div>

    <div class="mt-4 space-y-2">
        <button v-if="!localOrder.pagado" @click="openAddItemsModal(localOrder)" class="w-full bg-gray-500 text-white font-bold py-2 rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2">
            <i class="ph ph-plus-circle"></i>
            <span>Añadir Items</span>
        </button>
        <button v-if="localOrder.estado === 'en validacion'" @click="openConfirmationModal(localOrder, 'en preparacion')" class="w-full bg-blue-500 text-white font-bold py-2 rounded-lg hover:bg-blue-600">Validar Pedido</button>
        <button v-if="localOrder.estado === 'listo para entregar'" @click="openConfirmationModal(localOrder, 'entregado')" class="w-full bg-purple-500 text-white font-bold py-2 rounded-lg hover:bg-purple-600">Marcar como Entregado</button>
        
        <div class="flex gap-2">
            <button @click="openConfirmationModal(localOrder, 'pagar')" class="w-full bg-emerald-500 text-white font-bold py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed" :disabled="localOrder.pagado">
                <span v-if="!localOrder.pagado">Pagar</span>
                <span v-else class="flex items-center justify-center gap-2"><i class="ph ph-check-circle"></i> Pagado</span>
            </button>
            <button v-if="!localOrder.pagado" @click="openConfirmationModal(localOrder, 'cancelar')" class="w-full bg-red-500 text-white font-bold py-2 rounded-lg hover:bg-red-600">Cancelar</button>
        </div>
    </div>
  </div>
  
  <div v-if="confirmation.isOpen" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 text-center">
          <i :class="confirmation.icon" class="text-5xl mb-4"></i>
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Confirmar Acción</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-6">{{ confirmation.message }}</p>
          <div class="flex justify-center gap-4">
              <button @click="closeConfirmationModal" class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">Cancelar</button>
              <button @click="executeConfirmation" :class="confirmation.confirmButtonClass" class="px-6 py-2 text-white font-semibold rounded-lg">Confirmar</button>
          </div>
      </div>
  </div>

  <AddItemsModal 
      :is-visible="addItemsModal.isOpen" 
      :pedido-id="addItemsModal.pedidoId"
      @close="closeAddItemsModal"
      @items-added="fetchOrder"
  />
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import apiClient from '../services/api';
import AddItemsModal from './AddItemsModal.vue'; // Este será nuestro siguiente componente a crear

const props = defineProps(['order']);
const emit = defineEmits(['order-updated']);

const localOrder = ref(JSON.parse(JSON.stringify(props.order)));
const currentTime = ref(new Date());
const confirmation = ref({ isOpen: false, message: '', icon: '', confirmButtonClass: '', onConfirm: () => {} });
const addItemsModal = ref({ isOpen: false, pedidoId: null });
let timerIntervalId = null;

const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0);

const fetchOrder = async () => {
    try {
        const response = await apiClient.get(`/pedidos/${localOrder.value.id}`);
        localOrder.value = response.data;
        emit('order-updated', response.data);
    } catch (error) {
        console.error("Error fetching order:", error);
    }
};

const updateOrderStatus = async (pedidoId, nuevoEstado) => {
    try { 
        const response = await apiClient.patch(`/pedidos/${pedidoId}/estado`, { estado: nuevoEstado });
        localOrder.value = response.data;
        emit('order-updated', response.data);
    } catch (error) { console.error("Error al actualizar estado:", error); }
};

const markAsPaid = async (pedidoId) => {
    try {
        const response = await apiClient.patch(`/pedidos/${pedidoId}/pagar`);
        localOrder.value = response.data;
        emit('order-updated', response.data);
    } catch(error) { console.error("Error al marcar como pagado:", error); }
};

const openConfirmationModal = (pedido, action) => {
    const details = {
        'en preparacion': { message: `¿Confirmas validar el pedido #${pedido.id} y enviarlo a cocina?`, icon: 'ph-duotone ph-question text-blue-500', confirmButtonClass: 'bg-blue-500 hover:bg-blue-600', onConfirm: () => updateOrderStatus(pedido.id, 'en preparacion') },
        'entregado': { message: `¿Confirmas que el pedido #${pedido.id} ha sido entregado al cliente?`, icon: 'ph-duotone ph-smiley text-purple-500', confirmButtonClass: 'bg-purple-500 hover:bg-purple-600', onConfirm: () => updateOrderStatus(pedido.id, 'entregado') },
        'pagar': { message: `¿Confirmas el pago de ${formatCurrency(pedido.total)} para el pedido #${pedido.id}?`, icon: 'ph-duotone ph-money text-emerald-500', confirmButtonClass: 'bg-emerald-500 hover:bg-emerald-600', onConfirm: () => markAsPaid(pedido.id) },
        'cancelar': { message: `¿Estás seguro de que quieres CANCELAR el pedido #${pedido.id}?`, icon: 'ph-duotone ph-warning-circle text-red-500', confirmButtonClass: 'bg-red-500 hover:bg-red-600', onConfirm: () => updateOrderStatus(pedido.id, 'cancelado') }
    };
    confirmation.value = { ...details[action], isOpen: true };
};

const closeConfirmationModal = () => { confirmation.value.isOpen = false; };
const executeConfirmation = () => { confirmation.value.onConfirm(); closeConfirmationModal(); };

const openAddItemsModal = (pedido) => { addItemsModal.value = { isOpen: true, pedidoId: pedido.id }; };
const closeAddItemsModal = () => { addItemsModal.value = { isOpen: false, pedidoId: null }; };

const calculateElapsedTime = (startTime) => {
    const start = new Date(startTime);
    const elapsed = Math.floor((currentTime.value.getTime() - start.getTime()) / 1000);
    if (elapsed < 0) return '00:00';
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
};

const getStatusText = (estado) => (estado ? estado.replace('_', ' ') : '');
const getStatusColor = (estado) => ({ 'en validacion': 'text-gray-500 dark:text-gray-400', 'en preparacion': 'text-yellow-600 dark:text-yellow-400', 'listo para entregar': 'text-blue-600 dark:text-blue-400', 'entregado': 'text-purple-600 dark:text-purple-400', 'cancelado': 'text-red-500' }[estado] || 'text-gray-500 dark:text-gray-400');
const getCardBorder = (estado) => ({ 'en validacion': 'border-l-4 border-gray-400', 'en preparacion': 'border-l-4 border-yellow-500', 'listo para entregar': 'border-l-4 border-blue-500', 'entregado': 'border-l-4 border-purple-500' }[estado] || '');

watch(() => props.order, (newOrder) => {
    localOrder.value = JSON.parse(JSON.stringify(newOrder));
}, { deep: true });

onMounted(() => {
    timerIntervalId = setInterval(() => {
        currentTime.value = new Date();
    }, 1000);
});

onBeforeUnmount(() => {
    if (timerIntervalId) clearInterval(timerIntervalId);
});
</script>