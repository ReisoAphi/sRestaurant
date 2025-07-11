<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col h-full">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-4 mb-4">Orden Actual</h2>
    
    <div v-if="isWaiter" class="mb-4">
      <label for="mesa" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de la Mesa / Cliente</label>
      <input type="text" id="mesa" v-model="cart.mesaNombre" class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:text-white">
    </div>

    <div class="flex-1 overflow-y-auto pr-2">
      <div v-if="cart.items.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-10">
        <i class="ph-duotone ph-shopping-cart text-5xl"></i>
        <p class="mt-2">Añade productos para empezar</p>
      </div>
      <ul v-else class="divide-y divide-gray-200 dark:divide-gray-700">
        <li v-for="item in cart.items" :key="item.id" class="py-3 flex items-center">
          <div class="flex-1">
            <p class="font-semibold text-gray-800 dark:text-gray-200">{{ item.nombre }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatCurrency(item.precio) }}</p>
          </div>
          <div class="flex items-center">
            <input type="number" min="1" :value="item.cantidad" @change="updateQuantity(item.id, $event.target.value)" class="w-16 text-center border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white">
            <button @click="cart.removeItem(item.id)" class="ml-3 text-red-500 hover:text-red-700">
              <i class="ph ph-trash text-xl"></i>
            </button>
          </div>
        </li>
      </ul>
    </div>

    <div v-if="cart.totalItems > 0" class="border-t dark:border-gray-700 pt-4 mt-4 space-y-2 text-gray-700 dark:text-gray-300">
      <div class="flex justify-between"><span>Subtotal</span><span class="font-medium">{{ formatCurrency(cart.subtotal) }}</span></div>
      <div class="flex justify-between"><span>Impuestos (16%)</span><span class="font-medium">{{ formatCurrency(cart.impuestos) }}</span></div>
      <div class="flex justify-between text-xl font-bold text-gray-900 dark:text-white"><span>Total</span><span>{{ formatCurrency(cart.total) }}</span></div>
    </div>

    <div class="mt-6">
      <button @click="handleCheckout" class="w-full py-3 px-4 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50" :disabled="cart.totalItems === 0 || isSubmitting">
        <span v-if="isSubmitting">Enviando...</span>
        <span v-else>{{ isWaiter ? 'Enviar a Cocina' : 'Realizar Pedido' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';

const props = defineProps({
  isWaiter: {
    type: Boolean,
    default: false
  }
});

const cart = useCartStore();
const router = useRouter();
const isSubmitting = ref(false);

const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0);
const updateQuantity = (id, newQty) => cart.updateQuantity(id, parseInt(newQty, 10));

const handleCheckout = async () => {
    if (isSubmitting.value) return;
    isSubmitting.value = true;
    try {
        if (props.isWaiter) {
            const success = await cart.submitWaiterPedido();
            if(success) {
                alert('¡Pedido enviado a cocina!');
                router.push('/mesero');
            }
        } else {
            await cart.submitPedido();
        }
    } catch (error) {
        console.error("Error al enviar el pedido:", error);
        alert("Hubo un problema al enviar tu pedido. Inténtalo de nuevo.");
    } finally {
        isSubmitting.value = false;
    }
};
</script>