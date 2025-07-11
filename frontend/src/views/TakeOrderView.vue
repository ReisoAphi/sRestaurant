<template>
  <div class="flex flex-col md:flex-row gap-6 h-full">
    <div class="w-full md:w-2/3">
      <div class="mb-4">
        <input type="text" v-model="searchTerm" placeholder="Buscar producto..." class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
      </div>
      <div class="flex flex-wrap gap-2 mb-6">
          <button @click="selectedCategory = null" :class="{'bg-emerald-500 text-white': !selectedCategory, 'bg-white dark:bg-gray-800': selectedCategory}" class="px-4 py-2 rounded-full shadow-sm text-sm font-medium transition-colors">Todos</button>
          <button v-for="category in categories" :key="category.id" @click="selectedCategory = category.id" :class="{'bg-emerald-500 text-white': selectedCategory === category.id, 'bg-white dark:bg-gray-800': selectedCategory !== category.id}" class="px-4 py-2 rounded-full shadow-sm text-sm font-medium transition-colors">{{ category.nombre }}</button>
      </div>

      <div v-if="loading" class="text-center py-10">Cargando...</div>
      <div v-else-if="filteredProducts.length === 0" class="text-center py-20">
          <i class="ph-duotone ph-smiley-sad text-6xl text-gray-400"></i>
          <p class="mt-4 text-gray-600 dark:text-gray-400">No se encontraron productos.</p>
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
           <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product" @add-to-cart="cart.addItem"/>
      </div>
    </div>

    <div class="w-full md:w-1/3">
        <CartComponent :is-waiter="false" />
    </div>
  </div>
</template>

<script setup>
// El <script setup> que ya tienes es correcto, no necesitas cambiarlo.
import { ref, computed, onMounted } from 'vue';
import { useCartStore } from '../stores/cart';
import apiClient from '../services/api';
import ProductCard from '../components/ProductCard.vue';
import CartComponent from '../components/CartComponent.vue';

// ... tu lógica de fetch, etc.
const cart = useCartStore();
const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const searchTerm = ref('');
const selectedCategory = ref(null);

const fetchProductsAndCategories = async () => {
    try {
        loading.value = true;
        const productsRes = await apiClient.get('/productos');
        products.value = productsRes.data;
        const categoriesRes = await apiClient.get('/categorias');
        categories.value = categoriesRes.data;
    } catch (error) {
        console.error("Error al cargar datos:", error);
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

onMounted(fetchProductsAndCategories);
</script>