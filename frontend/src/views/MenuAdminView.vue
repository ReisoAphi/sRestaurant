<template>
  <div class="space-y-8">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Ingredientes</h2>
        <button @click="openIngredientModal()" class="bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-cyan-600 transition-colors">
          <PhPlus :size="20" weight="bold" />
          <span>Añadir Ingrediente</span>
        </button>
      </div>
      <ul class="space-y-2">
        <li v-for="ing in ingredients" :key="ing.id" class="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <div>
            <span class="font-medium dark:text-gray-300">{{ ing.nombre }}</span>
            <span v-if="ing.costo_extra > 0" class="text-xs text-gray-500 dark:text-gray-400 ml-2">(Costo extra: {{ formatCurrency(ing.costo_extra) }})</span>
          </div>
          <div class="space-x-2">
            <button @click="openIngredientModal(ing)" class="text-blue-500 hover:text-blue-700 p-1" title="Editar"><PhPencilSimple :size="20" /></button>
            <button @click="deleteIngredient(ing)" class="text-red-500 hover:text-red-700 p-1" title="Eliminar"><PhTrash :size="20" /></button>
          </div>
        </li>
      </ul>
    </div>

    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Categorías</h2>
        <button @click="openCategoryModal()" class="bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-600 transition-colors">
          <PhPlus :size="20" weight="bold" />
          <span>Añadir Categoría</span>
        </button>
      </div>
      <ul class="space-y-2">
        <li v-for="cat in categories" :key="cat.id" class="flex justify-between items-center p-3 rounded-lg" :class="cat.visible ? 'bg-gray-50 dark:bg-gray-700/50' : 'bg-red-50 dark:bg-red-900/20'">
          <div>
            <span class="font-medium dark:text-gray-300" :class="{'text-gray-400 dark:text-gray-500 line-through': !cat.visible}">{{ cat.nombre }}</span>
            <span v-if="!cat.visible" class="text-xs text-red-600 font-semibold ml-2">OCULTO</span>
          </div>
          <div class="space-x-2">
            <button @click="openCategoryModal(cat)" class="text-blue-500 hover:text-blue-700 p-1" title="Editar"><PhPencilSimple :size="20" /></button>
            <button v-if="cat.visible" @click="toggleVisibility('category', cat)" class="text-red-500 hover:text-red-700 p-1" title="Ocultar"><PhEyeSlash :size="20" /></button>
            <button v-else @click="toggleVisibility('category', cat)" class="text-green-500 hover:text-green-700 p-1" title="Restaurar"><PhEye :size="20" /></button>
          </div>
        </li>
      </ul>
    </div>

    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Productos</h2>
        <button @click="openProductModal()" class="bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-600 transition-colors">
          <PhPlus :size="20" weight="bold" />
          <span>Añadir Producto</span>
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
                <img :src="getImageUrl(prod.imagen_url)" @error="onImageError" class="w-10 h-10 rounded-md object-cover bg-gray-200">
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
                <button @click="openProductModal(prod)" class="text-blue-500 hover:text-blue-700 p-1" title="Editar"><PhPencilSimple :size="20" /></button>
                <button v-if="prod.visible" @click="toggleVisibility('product', prod)" class="text-red-500 hover:text-red-700 p-1" title="Ocultar"><PhEyeSlash :size="20" /></button>
                <button v-else @click="toggleVisibility('product', prod)" class="text-green-500 hover:text-green-700 p-1" title="Restaurar"><PhEye :size="20" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="ingredientModal.isOpen" @click.self="closeIngredientModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      </div>

    <div v-if="categoryModal.isOpen" @click.self="closeCategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
       </div>

    <div v-if="productModal.isOpen" @click.self="closeProductModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-lg max-h-[90vh] flex flex-col">
        <h3 class="text-2xl font-bold mb-6 dark:text-gray-100 shrink-0">{{ productModal.isEdit ? 'Editar' : 'Nuevo' }} Producto</h3>
        <form @submit.prevent="handleProductSubmit" class="space-y-4 overflow-y-auto flex-1 pr-2">
          <div>
            <label for="prod-imagen" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Imagen del Producto</label>
            <input @change="handleImageUpload" id="prod-imagen" type="file" accept="image/*" class="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 dark:file:bg-emerald-900/50 file:text-emerald-700 dark:file:text-emerald-300 hover:file:bg-emerald-100 dark:hover:file:bg-emerald-800/50">
            <div v-if="imagePreviewUrl || (productModal.current.imagen_url && !imagePreviewUrl)" class="mt-4 border dark:border-gray-600 rounded-md p-2 inline-block">
              <img :src="imagePreviewUrl || getImageUrl(productModal.current.imagen_url)" @error="onImageError" class="w-32 h-32 object-cover rounded-md bg-gray-200">
            </div>
          </div>
          <div class="flex justify-end gap-4 pt-4 shrink-0">
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
import { PhPlus, PhPencilSimple, PhTrash, PhEye, PhEyeSlash } from "phosphor-vue";

const products = ref([]);
const categories = ref([]);
const ingredients = ref([]);
const loading = ref(true);

const categoryModal = ref({ isOpen: false, isEdit: false, current: {} });
const productModal = ref({ isOpen: false, isEdit: false, current: { ingredientes: [] } });
const ingredientModal = ref({ isOpen: false, isEdit: false, current: {} });
const imagePreviewUrl = ref(null);
const selectedFile = ref(null);

const onImageError = (event) => {
    event.target.src = 'https://placehold.co/40x40/e2e8f0/64748b?text=??';
};

const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0);

const fetchData = async () => {
  loading.value = true;
  try {
    const [prodRes, catRes, ingRes] = await Promise.all([
      apiClient.get('/productos/admin/all'),
      apiClient.get('/categorias/admin/all'),
      apiClient.get('/ingredientes')
    ]);
    products.value = prodRes.data;
    categories.value = catRes.data;
    ingredients.value = ingRes.data;
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

// --- Lógica de Ingredientes ---
const openIngredientModal = (ing = null) => {
  if (ing) {
    ingredientModal.value = { isOpen: true, isEdit: true, current: { ...ing } };
  } else {
    ingredientModal.value = { isOpen: true, isEdit: false, current: { nombre: '', costo_extra: 0 } };
  }
};
const closeIngredientModal = () => ingredientModal.value.isOpen = false;

const handleIngredientSubmit = async () => {
  const { isEdit, current } = ingredientModal.value;
  try {
    if (isEdit) {
      await apiClient.put(`/ingredientes/${current.id}`, current);
    } else {
      await apiClient.post('/ingredientes', current);
    }
    await fetchData();
    closeIngredientModal();
  } catch (error) {
    alert(error.response?.data?.message || 'Error al guardar el ingrediente.');
  }
};
const deleteIngredient = async (ing) => {
    if(!confirm(`¿Seguro que quieres eliminar "${ing.nombre}"? Esto podría afectar a los productos que lo usen.`)) return;
    try {
        await apiClient.delete(`/ingredientes/${ing.id}`);
        await fetchData();
    } catch(error) {
        alert(error.response?.data?.message || 'Error al eliminar el ingrediente.');
    }
}

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
    productModal.value = { 
        isOpen: true, 
        isEdit: true, 
        current: { ...prod, ingredientes: prod.ingredientes.map(i => i.id) }
    };
  } else {
    productModal.value = { isOpen: true, isEdit: false, current: { nombre: '', descripcion: '', precio: '', imagen_url: '', categoriaId: null, ingredientes: [] } };
  }
};
const closeProductModal = () => productModal.value.isOpen = false;

const handleProductSubmit = async () => {
  const { isEdit, current } = productModal.value;
  
  const formData = new FormData();
  Object.entries(current).forEach(([key, value]) => {
    if (key === 'ingredientes' && Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  if (selectedFile.value) {
    formData.append('imagen', selectedFile.value);
  } else if (!isEdit && !current.imagen_url) {
      formData.delete('imagen_url');
  }

  try {
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    if (isEdit) {
      await apiClient.put(`/productos/admin/${current.id}`, formData, config);
    } else {
      await apiClient.post('/productos/admin', formData, config);
    }
    await fetchData();
    closeProductModal();
  } catch (error) {
    console.error(error);
    alert(error.response?.data?.message || 'Error al guardar el producto.');
  }
};

const toggleVisibility = async (type, item) => {
  const endpoint = type === 'category' ? `/categorias/${item.id}` : `/productos/admin/${item.id}`;
  
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