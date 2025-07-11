<template>
  <div class="space-y-8">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Categorías</h2>
        <button @click="openCategoryModal()" class="bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-600">
          <i class="ph ph-plus"></i> Añadir Categoría
        </button>
      </div>
      <ul class="space-y-2">
        <li v-for="cat in categories" :key="cat.id" class="flex justify-between items-center p-3 rounded-lg" :class="cat.visible ? 'bg-gray-50 dark:bg-gray-700/50' : 'bg-red-50 dark:bg-red-900/20'">
          <div>
            <span class="font-medium dark:text-gray-300" :class="{'text-gray-400 dark:text-gray-500 line-through': !cat.visible}">{{ cat.nombre }}</span>
            <span v-if="!cat.visible" class="text-xs text-red-600 font-semibold ml-2">OCULTO</span>
          </div>
          <div class="space-x-2">
            <button @click="openCategoryModal(cat)" class="text-blue-500 hover:text-blue-700 p-1"><i class="ph ph-pencil-simple"></i></button>
            <button v-if="cat.visible" @click="toggleVisibility('category', cat)" class="text-red-500 hover:text-red-700 p-1" title="Ocultar"><i class="ph ph-eye-slash"></i></button>
            <button v-else @click="toggleVisibility('category', cat)" class="text-green-500 hover:text-green-700 p-1" title="Restaurar"><i class="ph ph-eye"></i></button>
          </div>
        </li>
      </ul>
    </div>

    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Productos</h2>
        <button @click="openProductModal()" class="bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-600">
          <i class="ph ph-plus"></i> Añadir Producto
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th class="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Producto</th>
              <th class="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Categoría</th>
              <th class="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Precio</th>
              <th class="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Estado</th>
              <th class="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="prod in products" :key="prod.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50" :class="{'opacity-50': !prod.visible}">
              <td class="p-3 font-medium flex items-center gap-3 text-gray-800 dark:text-gray-200">
                <img :src="prod.imagen_url || 'https://placehold.co/40x40/e2e8f0/64748b?text=??'" class="w-10 h-10 rounded-md object-cover">
                <span>{{ prod.nombre }}</span>
              </td>
              <td class="p-3 text-sm text-gray-500 dark:text-gray-400">{{ prod.categoria ? prod.categoria.nombre : 'N/A' }}</td>
              <td class="p-3 text-sm text-gray-800 dark:text-gray-100 font-semibold">{{ formatCurrency(prod.precio) }}</td>
              <td class="p-3 text-sm">
                <span class="px-2 py-1 rounded-full text-xs font-medium" :class="prod.visible ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'">
                  {{ prod.visible ? 'Visible' : 'Oculto' }}
                </span>
              </td>
              <td class="p-3 text-right">
                <button @click="openProductModal(prod)" class="text-blue-500 hover:text-blue-700 p-1"><i class="ph ph-pencil-simple"></i></button>
                <button v-if="prod.visible" @click="toggleVisibility('product', prod)" class="text-red-500 hover:text-red-700 p-1" title="Ocultar"><i class="ph ph-eye-slash"></i></button>
                <button v-else @click="toggleVisibility('product', prod)" class="text-green-500 hover:text-green-700 p-1" title="Restaurar"><i class="ph ph-eye"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="categoryModal.isOpen" @click.self="closeCategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h3 class="text-2xl font-bold mb-6 dark:text-gray-100">{{ categoryModal.isEdit ? 'Editar' : 'Nueva' }} Categoría</h3>
        <form @submit.prevent="handleCategorySubmit">
          <div class="mb-4">
            <label for="cat-nombre" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
            <input v-model="categoryModal.current.nombre" id="cat-nombre" type="text" class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm" required>
          </div>
          <div class="flex justify-end gap-4 mt-8">
            <button type="button" @click="closeCategoryModal" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-lg">Cancelar</button>
            <button type="submit" class="px-4 py-2 bg-emerald-500 text-white rounded-lg">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="productModal.isOpen" @click.self="closeProductModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h3 class="text-2xl font-bold mb-6 dark:text-gray-100">{{ productModal.isEdit ? 'Editar' : 'Nuevo' }} Producto</h3>
        <form @submit.prevent="handleProductSubmit" class="space-y-4">
          <input v-model="productModal.current.nombre" type="text" placeholder="Nombre del producto" class="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm" required>
          <textarea v-model="productModal.current.descripcion" placeholder="Descripción" class="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm" rows="3"></textarea>
          <input v-model="productModal.current.precio" type="number" step="0.01" placeholder="Precio" class="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm" required>
          <select v-model="productModal.current.categoriaId" class="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm" required>
            <option :value="null" disabled>Selecciona una categoría</option>
            <option v-for="cat in categories.filter(c => c.visible)" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
          </select>
          <div>
            <label for="prod-imagen" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Imagen del Producto</label>
            <input @change="handleImageUpload" id="prod-imagen" type="file" accept="image/*" class="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 dark:file:bg-emerald-900/50 file:text-emerald-700 dark:file:text-emerald-300 hover:file:bg-emerald-100 dark:hover:file:bg-emerald-800/50">
            <div v-if="imagePreviewUrl || productModal.current.imagen_url" class="mt-4 border dark:border-gray-600 rounded-md p-2 inline-block">
              <img :src="imagePreviewUrl || productModal.current.imagen_url" class="w-32 h-32 object-cover rounded-md">
            </div>
          </div>
          <div class="flex justify-end gap-4 pt-4">
            <button type="button" @click="closeProductModal" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-lg">Cancelar</button>
            <button type="submit" class="px-4 py-2 bg-emerald-500 text-white rounded-lg">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../services/api';

const products = ref([]);
const categories = ref([]);
const loading = ref(true);

const categoryModal = ref({ isOpen: false, isEdit: false, current: {} });
const productModal = ref({ isOpen: false, isEdit: false, current: {} });
const imagePreviewUrl = ref(null);
const selectedFile = ref(null);

const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0);

const fetchData = async () => {
  loading.value = true;
  try {
    const [prodRes, catRes] = await Promise.all([
      apiClient.get('/productos/admin/all'),
      apiClient.get('/categorias/admin/all')
    ]);
    products.value = prodRes.data;
    categories.value = catRes.data;
  } catch (error) {
    console.error("Error al cargar datos de menú:", error);
    alert("No se pudieron cargar los datos del menú.");
  } finally {
    loading.value = false;
  }
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    imagePreviewUrl.value = URL.createObjectURL(file);
  }
};

// --- Lógica de Categorías ---
const openCategoryModal = (cat = null) => {
  if (cat) {
    categoryModal.value = { isOpen: true, isEdit: true, current: { ...cat } };
  } else {
    categoryModal.value = { isOpen: true, isEdit: false, current: { nombre: '' } };
  }
};
const closeCategoryModal = () => categoryModal.value.isOpen = false;
const handleCategorySubmit = async () => {
  const { isEdit, current } = categoryModal.value;
  try {
    if (isEdit) {
      await apiClient.put(`/categorias/${current.id}`, current);
    } else {
      await apiClient.post('/categorias', current);
    }
    await fetchData();
    closeCategoryModal();
  } catch (error) {
    alert(error.response?.data?.message || 'Error al guardar la categoría.');
  }
};

// --- Lógica de Productos ---
const openProductModal = (prod = null) => {
  imagePreviewUrl.value = null;
  selectedFile.value = null;
  if (prod) {
    productModal.value = { isOpen: true, isEdit: true, current: { ...prod } };
  } else {
    productModal.value = { isOpen: true, isEdit: false, current: { nombre: '', descripcion: '', precio: '', imagen_url: '', categoriaId: null } };
  }
};
const closeProductModal = () => productModal.value.isOpen = false;
const handleProductSubmit = async () => {
  const { isEdit, current } = productModal.value;
  
  const formData = new FormData();
  formData.append('nombre', current.nombre);
  formData.append('descripcion', current.descripcion || '');
  formData.append('precio', current.precio);
  formData.append('categoriaId', current.categoriaId);

  if (selectedFile.value) {
    formData.append('imagen', selectedFile.value);
  }

  try {
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    if (isEdit) {
      // La ruta para actualizar un producto necesita el /admin/
      await apiClient.put(`/productos/admin/${current.id}`, formData, config);
    } else {
      await apiClient.post('/productos/admin', formData, config);
    }
    await fetchData();
    closeProductModal();
  } catch (error) {
    alert(error.response?.data?.message || 'Error al guardar el producto.');
  }
};

const toggleVisibility = async (type, item) => {
  const endpoint = type === 'category' ? `/categorias/${item.id}` : `/productos/admin/${item.id}`; // Corregido para usar la ruta de admin
  
  try {
    if (item.visible) {
      await apiClient.delete(endpoint);
    } else {
      await apiClient.patch(`${endpoint}/restore`);
    }
    await fetchData();
  } catch (error) {
    alert(error.response?.data?.message || `Error al cambiar la visibilidad.`);
  }
};

onMounted(fetchData);
</script>