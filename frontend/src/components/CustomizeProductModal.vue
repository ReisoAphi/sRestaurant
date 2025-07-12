<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div v-if="product" class="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col">
      <header class="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">{{ product.nombre }}</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <i class="ph ph-x text-3xl"></i>
        </button>
      </header>
      
      <div class="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
        <div v-if="product.ingredientes && product.ingredientes.length > 0">
          <h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Ingredientes Base</h3>
          <div class="space-y-2">
            <label v-for="ing in product.ingredientes" :key="ing.id" class="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <input type="checkbox" :value="ing.id" v-model="ingredientesSeleccionados" class="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500">
              <span class="ml-3 text-gray-800 dark:text-gray-200">{{ ing.nombre }}</span>
            </label>
          </div>
        </div>

        <div v-if="extrasDisponibles.length > 0">
          <h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Añadir Extras</h3>
          <div class="space-y-2">
             <label v-for="extra in extrasDisponibles" :key="extra.id" class="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <input type="checkbox" :value="extra.id" v-model="ingredientesAgregados" class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
              <span class="ml-3 flex-1 text-gray-800 dark:text-gray-200">{{ extra.nombre }}</span>
              <span class="font-medium text-blue-600 dark:text-blue-400">+ {{ formatCurrency(extra.costo_extra) }}</span>
            </label>
          </div>
        </div>
      </div>

      <footer class="p-4 border-t dark:border-gray-700">
        <button @click="confirmAddToCart" class="w-full py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600">
          Añadir al Carrito por {{ formatCurrency(precioFinal) }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  isVisible: Boolean,
  product: Object,
  todosLosIngredientes: Array
});

const emit = defineEmits(['close', 'add-to-cart']);

const ingredientesSeleccionados = ref([]);
const ingredientesAgregados = ref([]);

const extrasDisponibles = computed(() => {
  if (!props.product || !props.todosLosIngredientes) return [];
  const idsBase = props.product.ingredientes.map(i => i.id);
  return props.todosLosIngredientes.filter(i => !idsBase.includes(i.id) && i.costo_extra > 0);
});

const precioFinal = computed(() => {
    if (!props.product) return 0;
    let total = parseFloat(props.product.precio);
    ingredientesAgregados.value.forEach(extraId => {
        const extra = props.todosLosIngredientes.find(i => i.id === extraId);
        if(extra) total += parseFloat(extra.costo_extra);
    });
    return total;
});

watch(() => props.product, (newProduct) => {
  if (newProduct && newProduct.ingredientes) {
    ingredientesSeleccionados.value = newProduct.ingredientes.map(ing => ing.id);
    ingredientesAgregados.value = [];
  }
});

const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0);

const confirmAddToCart = () => {
  const ingredientesBaseIds = props.product.ingredientes.map(ing => ing.id);
  const personalizacion = {
    removidos: ingredientesBaseIds.filter(id => !ingredientesSeleccionados.value.includes(id)),
    agregados: ingredientesAgregados.value,
  };
  
  // Creamos una copia del producto para no mutar el original y le añadimos el precio final calculado
  const productoParaCarrito = {
      ...props.product,
      precio: precioFinal.value
  };

  emit('add-to-cart', { producto: productoParaCarrito, personalizacion });
  emit('close');
};
</script>