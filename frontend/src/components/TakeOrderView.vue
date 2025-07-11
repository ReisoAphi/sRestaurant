<template>
    <div class="flex flex-col md:flex-row gap-6 h-full">
        <div class="w-full md:w-2/3">
            <div class="mb-4">
              <input type="text" v-model="searchTerm" placeholder="Buscar producto..." class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            </div>
            <div v-if="loading" class="text-center py-10">Cargando...</div>
            <transition-group v-else name="slide-up" tag="div" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                 <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product" @add-to-cart="cart.addItem"/>
            </transition-group>
        </div>
        <div class="w-full md:w-1/3 hidden md:flex flex-col">
            <CartComponent :is-waiter="false" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCartStore } from '../stores/cart';
import apiClient from '../services/api';
import ProductCard from '../components/ProductCard.vue';
import CartComponent from '../components/CartComponent.vue';

const cart = useCartStore();
const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const searchTerm = ref('');
const selectedCategory = ref(null);

const fetchProductsAndCategories = async () => {
    try {
        loading.value = true;
        const [productsRes, categoriesRes] = await Promise.all([
            apiClient.get('/productos'),
            apiClient.get('/categorias')
        ]);
        products.value = productsRes.data;
        categories.value = categoriesRes.data;
    } catch (error) {
        console.error("Error al cargar datos:", error);
    } finally {
        loading.value = false;
    }
};

const filteredProducts = computed(() => {
    // ... tu lógica de filtrado ...
    return products.value;
});

onMounted(fetchProductsAndCategories);
</script>