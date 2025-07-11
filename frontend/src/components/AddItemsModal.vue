<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
    <div class="w-full max-w-4xl h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col">
      <header class="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Añadir a Pedido #{{ pedidoId }}</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <i class="ph ph-x text-3xl"></i>
        </button>
      </header>
      
      <div class="flex-1 flex flex-col md:flex-row gap-6 p-4 overflow-hidden">
        <div class="w-full md:w-2/3 flex flex-col">
          <div class="mb-4"><input type="text" v-model="searchTerm" placeholder="Buscar producto..." class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"></div>
          <div class="flex flex-wrap gap-2 mb-4">
            <button @click="selectedCategory = null" :class="{'bg-emerald-500 text-white': selectedCategory === null, 'bg-white dark:bg-gray-700': selectedCategory !== null}" class="px-4 py-2 rounded-full shadow-sm text-sm font-medium transition-colors">Todos</button>
            <button v-for="category in categories" :key="category.id" @click="selectedCategory = category.id" :class="{'bg-emerald-500 text-white': selectedCategory === category.id, 'bg-white dark:bg-gray-700': selectedCategory !== category.id}" class="px-4 py-2 rounded-full shadow-sm text-sm font-medium transition-colors">{{ category.nombre }}</button>
          </div>
          <div v-if="loading" class="flex-1 flex items-center justify-center"><i class="ph-duotone ph-spinner-gap animate-spin text-5xl text-emerald-500"></i></div>
          <div v-else-if="filteredProducts.length === 0" class="flex-1 flex items-center justify-center"><p class="dark:text-gray-400">No se encontraron productos.</p></div>
          <div v-else class="flex-1 overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product" @add-to-cart="addItem"/>
          </div>
        </div>

        <div class="w-full md:w-1/3 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 flex flex-col">
          <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-3 mb-3">Nuevos Items</h3>
          <div class="flex-1 overflow-y-auto">
            <div v-if="newItems.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-10">
              <p>Añade productos del menú.</p>
            </div>
            <ul v-else class="divide-y divide-gray-200 dark:divide-gray-700">
              <li v-for="item in newItems" :key="item.id" class="py-2 flex items-center">
                <div class="flex-1">
                  <p class="font-semibold text-gray-800 dark:text-gray-200">{{ item.nombre }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatCurrency(item.precio) }}</p>
                </div>
                <div class="flex items-center">
                  <input type="number" min="1" :value="item.cantidad" @change="updateQuantity(item.id, $event.target.value)" class="w-16 text-center border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white">
                  <button @click="removeItem(item.id)" class="ml-2 text-red-500 hover:text-red-700"><i class="ph ph-trash"></i></button>
                </div>
              </li>
            </ul>
          </div>
          <div class="border-t dark:border-gray-700 pt-4 mt-4">
            <button @click="confirmAddItems" class="w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50" :disabled="newItems.length === 0 || isSubmitting">
              <span v-if="isSubmitting">Añadiendo...</span>
              <span v-else>Confirmar Adición</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import apiClient from '../services/api';
import ProductCard from './ProductCard.vue';

const props = defineProps(['pedidoId', 'isVisible']);
const emit = defineEmits(['close', 'items-added']);

const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const searchTerm = ref('');
const selectedCategory = ref(null);
const newItems = ref([]);
const isSubmitting = ref(false);

const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0);

const fetchProductsAndCategories = async () => {
    try {
        loading.value = true;
        const productsRes = await apiClient.get('/productos');
        products.value = productsRes.data;
        const uniqueCategories = productsRes.data.reduce((acc, p) => {
            if (p.categoria && !acc.some(c => c.id === p.categoria.id)) {
                acc.push(p.categoria);
            }
            return acc;
        }, []);
        categories.value = uniqueCategories;
    } catch (error) {
        console.error("Error al cargar datos del menú:", error);
    } finally {
        loading.value = false;
    }
};

const filteredProducts = computed(() => {
    let filtered = products.value;
    if (selectedCategory.value) {
        filtered = filtered.filter(p => p.categoriaId === selectedCategory.value);
    }
    if (searchTerm.value) {
        filtered = filtered.filter(p => p.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()));
    }
    return filtered;
});

const addItem = (producto) => {
    const existingItem = newItems.value.find(item => item.id === producto.id);
    if (existingItem) {
        existingItem.cantidad++;
    } else {
        newItems.value.push({ ...producto, cantidad: 1 });
    }
};
const removeItem = (productoId) => {
    newItems.value = newItems.value.filter(item => item.id !== productoId);
};
const updateQuantity = (productoId, cantidad) => {
    const item = newItems.value.find(i => i.id === productoId);
    if (item) {
        if (cantidad > 0) {
            item.cantidad = parseInt(cantidad, 10);
        } else {
            removeItem(productoId);
        }
    }
};

const confirmAddItems = async () => {
    if (isSubmitting.value || newItems.value.length === 0) return;
    isSubmitting.value = true;
    try {
        const payload = {
            detalles: newItems.value.map(item => ({ productoId: item.id, cantidad: item.cantidad }))
        };
        await apiClient.post(`/pedidos/${props.pedidoId}/add-items`, payload);
        emit('items-added');
        emit('close');
    } catch (error) {
        console.error("Error al añadir items:", error);
        alert(error.response?.data?.message || 'No se pudieron añadir los productos.');
    } finally {
        isSubmitting.value = false;
    }
};

watch(() => props.isVisible, (newValue) => {
    if (newValue) {
        newItems.value = [];
        searchTerm.value = '';
        selectedCategory.value = null;
        if (products.value.length === 0) {
            fetchProductsAndCategories();
        }
    }
});
</script>