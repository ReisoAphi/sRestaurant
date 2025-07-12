<template>
  <div>
    <div v-if="cart.items.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-10 border-t dark:border-gray-700">
        <PhShoppingCart :size="48" weight="duotone" class="mx-auto" />
        <p class="mt-2">Añade productos para empezar</p>
    </div>
    <div v-else>
        <ul class="divide-y divide-gray-200 dark:divide-gray-700">
          <li v-for="item in cart.items" :key="item.key" class="py-3">
            <div class="flex items-center">
              <div class="flex-1">
                <p class="font-semibold text-gray-800 dark:text-gray-200">{{ item.nombre }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatCurrency(item.precio) }}</p>
              </div>
              <div class="flex items-center">
                <input type="number" min="1" :value="item.cantidad" @change="updateQuantity(item.key, $event.target.value)" class="w-16 text-center border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white">
                <button @click="cart.removeItem(item.key)" class="ml-3 text-red-500 hover:text-red-700" title="Eliminar artículo">
                  <PhTrash :size="20" />
                </button>
              </div>
            </div>
            <div v-if="item.personalizacion" class="pl-2 mt-2 text-xs">
                <p v-for="ingId in (item.personalizacion.agregados || [])" :key="`add-${ingId}`" class="text-blue-600 dark:text-blue-400 font-medium">
                  + {{ getIngredientNameById(ingId) }}
                </p>
                <p v-for="ingId in (item.personalizacion.removidos || [])" :key="`rem-${ingId}`" class="text-red-500 dark:text-red-400 font-medium">
                  - Sin {{ getIngredientNameById(ingId) }}
                </p>
            </div>
          </li>
        </ul>

        <div class="border-t dark:border-gray-700 pt-4 mt-4 space-y-2 text-gray-700 dark:text-gray-300">
            <div class="flex justify-between"><span>Subtotal</span><span class="font-medium">{{ formatCurrency(cart.subtotal) }}</span></div>
            <div class="flex justify-between"><span>Impuestos (16%)</span><span class="font-medium">{{ formatCurrency(cart.impuestos) }}</span></div>
            <div class="flex justify-between text-xl font-bold text-gray-900 dark:text-white"><span>Total</span><span>{{ formatCurrency(cart.total) }}</span></div>
        </div>

        <div class="mt-6">
            <button @click="submitOrder" class="w-full py-3 px-4 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50" :disabled="cart.items.length === 0 || isSubmitting || !cart.mesaNombre">
                <span v-if="isSubmitting">Enviando...</span>
                <span v-else>{{ isWaiter ? 'Enviar a Cocina' : 'Realizar Pedido' }}</span>
            </button>
            <p v-if="!cart.mesaNombre && cart.items.length > 0" class="text-xs text-red-500 text-center mt-2">
                Por favor, ingresa un nombre para la orden.
            </p>
        </div>
    </div>
  </div>
</template>

<script setup>
// Script sin cambios funcionales, solo se limpia lo que no se usa.
import { ref, onMounted } from 'vue';
import { useCartStore } from '../stores/cart';
import { PhShoppingCart, PhTrash } from 'phosphor-vue';
import apiClient from '../services/api';

const props = defineProps({
    isWaiter: { type: Boolean, default: false },
    allIngredients: { type: Array, default: () => [] }
});
const emit = defineEmits(['order-submitted']);
const cart = useCartStore();
const isSubmitting = ref(false);

const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0);
const updateQuantity = (key, newQty) => cart.updateQuantity(key, parseInt(newQty, 10));

const getIngredientNameById = (id) => {
    const ingredient = props.allIngredients.find(ing => ing.id === id);
    return ingredient ? ingredient.nombre : 'Ingrediente';
};

const submitOrder = async () => {
    isSubmitting.value = true;
    try {
        if (props.isWaiter) {
            const nuevoPedido = await cart.submitWaiterPedido();
            if (nuevoPedido) emit('order-submitted', nuevoPedido);
        } else {
            await cart.submitPedido();
        }
    } catch (error) {
        console.error("Error al enviar el pedido:", error);
        alert("Hubo un problema al enviar tu pedido.");
    } finally {
        isSubmitting.value = false;
    }
};
</script>