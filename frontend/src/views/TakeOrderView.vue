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

      <div v-if="loading" class="text-center py-10">
        <i class="ph-duotone ph-spinner-gap animate-spin text-5xl text-emerald-500"></i>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Cargando menú...</p>
      </div>
      <div v-else-if="filteredProducts.length === 0" class="text-center py-20">
          <i class="ph-duotone ph-smiley-sad text-6xl text-gray-400"></i>
          <p class="mt-4 text-gray-600 dark:text-gray-400">No se encontraron productos.</p>
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
           <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product" @customize="openCustomizationModal"/>
      </div>
    </div>

    <div class="w-full md:w-1/3">
        <CartComponent :is-waiter="false" :all-ingredients="allIngredients" />
    </div>

    <CustomizeProductModal 
      :is-visible="isModalVisible"
      :product="selectedProduct"
      :todos-los-ingredientes="allIngredients"
      @close="closeCustomizationModal"
      @add-to-cart="handleAddToCart"
    />
  </div>
</template>

<script setup>
// El script ya carga los ingredientes, solo nos aseguramos que el template los use
import { ref, computed, onMounted } from 'vue';
import { useCartStore } from '../stores/cart';
import apiClient from '../services/api';
import ProductCard from '../components/ProductCard.vue';
import CartComponent from '../components/CartComponent.vue';
import CustomizeProductModal from '../components/CustomizeProductModal.vue';

const cart = useCartStore();
const products = ref([]);
const categories = ref([]);
const allIngredients = ref([]);
const loading = ref(true);
const searchTerm = ref('');
const selectedCategory = ref(null);
const isModalVisible = ref(false);
const selectedProduct = ref(null);

const fetchMenuData = async () => {
    try {
        loading.value = true;
        const [productsRes, categoriesRes, ingredientsRes] = await Promise.all([
            apiClient.get('/productos'),
            apiClient.get('/categorias'),
            apiClient.get('/ingredientes')
        ]);
        products.value = productsRes.data;
        categories.value = categoriesRes.data;
        allIngredients.value = ingredientsRes.data;
    } catch (error) { console.error("Error al cargar datos:", error); }
    finally { loading.value = false; }
};
const filteredProducts = computed(() => {
    let filtered = products.value;
    if (selectedCategory.value) { filtered = filtered.filter(p => p.categoriaId === selectedCategory.value); }
    if (searchTerm.value) { filtered = filtered.filter(p => p.nombre.toLowerCase().includes(searchTerm.value.toLowerCase())); }
    return filtered;
});
const openCustomizationModal = (product) => { selectedProduct.value = product; isModalVisible.value = true; };
const closeCustomizationModal = () => { isModalVisible.value = false; selectedProduct.value = null; };
const handleAddToCart = ({ producto, personalizacion }) => { cart.addItem(producto, personalizacion); };

onMounted(fetchMenuData);
</script>