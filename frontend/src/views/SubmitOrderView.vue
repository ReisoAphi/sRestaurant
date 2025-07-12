<template>
  <div class="max-w-2xl mx-auto">
    <div v-if="!recentOrder">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div class="mb-6">
          <label for="mesaNombre" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre o Número de Mesa</label>
          <input 
              type="text" 
              id="mesaNombre" 
              v-model="cart.mesaNombre"
              class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
              placeholder="Ej: Mesa 5, Terraza, Juan Pérez"
          >
        </div>
        <CartComponent :is-waiter="true" @order-submitted="onOrderSubmitted" :all-ingredients="allIngredients" />
      </div>
    </div>

    <div v-else>
      <h2 class="text-xl font-bold text-center mb-4 dark:text-gray-200">Pedido Ingresado</h2>
      <OrderCard :order="recentOrder" @order-updated="handleOrderUpdate" />
      <div class="mt-4 text-center">
        <button @click="createNewOrder" class="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600">
          + Crear Otro Pedido
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCartStore } from '../stores/cart';
import apiClient from '../services/api';
import CartComponent from '../components/CartComponent.vue';
import OrderCard from '../components/OrderCard.vue';

const cart = useCartStore();
const recentOrder = ref(null);
const allIngredients = ref([]);

const fetchIngredients = async () => {
    try {
        const response = await apiClient.get('/ingredientes');
        allIngredients.value = response.data;
    } catch(error) {
        console.error("No se pudieron cargar los ingredientes:", error);
    }
};

const onOrderSubmitted = (newOrder) => {
  recentOrder.value = newOrder;
};

const handleOrderUpdate = (updatedOrder) => {
    if (updatedOrder) {
        recentOrder.value = updatedOrder;
    }
};

const createNewOrder = () => {
    recentOrder.value = null;
    cart.resetCart();
};

onMounted(fetchIngredients);
</script>