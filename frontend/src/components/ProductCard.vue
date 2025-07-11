<template>
  <div @click="$emit('addToCart', product)" class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col">
    <div class="h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative overflow-hidden">
        <img v-if="product.imagen_url" :src="product.imagen_url" @error="onImageError" class="w-full h-full object-cover" :alt="'Imagen de ' + product.nombre">
        <i v-else class="ph-duotone ph-hamburger text-6xl text-gray-400 dark:text-gray-500"></i>
    </div>
    <div class="p-4 flex-1 flex flex-col justify-between">
      <div>
        <h3 class="font-semibold text-gray-800 dark:text-gray-200 truncate">{{ product.nombre }}</h3>
        <p v-if="product.descripcion" class="text-xs text-gray-500 dark:text-gray-400 mt-1 h-8 overflow-hidden">{{ product.descripcion }}</p>
      </div>
      <p class="text-emerald-600 dark:text-emerald-400 font-bold mt-2">{{ formatCurrency(product.precio) }}</p>
    </div>
  </div>
</template>

<script setup>
// Define las propiedades (props) y eventos (emits) que el componente puede recibir/enviar
defineProps(['product']);
defineEmits(['addToCart']);

// Función para formatear la moneda
const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0);

// Función para manejar errores al cargar imágenes
const onImageError = (event) => {
    const placeholder = document.createElement('div');
    placeholder.className = 'w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700';
    placeholder.innerHTML = '<i class="ph-duotone ph-image-broken text-5xl text-gray-400 dark:text-gray-500"></i>';
    event.target.parentNode.replaceChild(placeholder, event.target);
};
</script>