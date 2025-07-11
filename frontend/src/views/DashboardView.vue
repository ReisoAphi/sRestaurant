<template>
  <div v-if="loading" class="text-center py-20">
    <i class="ph-duotone ph-spinner-gap animate-spin text-5xl text-emerald-500"></i>
    <p class="mt-4 text-gray-600 dark:text-gray-400">Cargando estadísticas...</p>
  </div>
  <div v-else-if="stats" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center gap-4">
        <i class="ph-duotone ph-chart-bar text-4xl text-blue-500"></i>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Ventas Totales</p>
          <p class="text-2xl font-bold text-gray-800 dark:text-gray-100">{{ formatCurrency(stats.totalSales) }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center gap-4">
        <i class="ph-duotone ph-sun text-4xl text-yellow-500"></i>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Ventas de Hoy</p>
          <p class="text-2xl font-bold text-gray-800 dark:text-gray-100">{{ formatCurrency(stats.todaySales) }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center gap-4">
        <i class="ph-duotone ph-receipt text-4xl text-green-500"></i>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Pedidos de Hoy</p>
          <p class="text-2xl font-bold text-gray-800 dark:text-gray-100">{{ stats.todayOrdersCount }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 class="font-semibold mb-4 dark:text-gray-200">Ventas de los Últimos 7 Días</h3>
        <canvas ref="salesChartCanvas"></canvas>
      </div>
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 class="font-semibold mb-4 dark:text-gray-200">Productos Más Vendidos</h3>
        <ul v-if="stats.topSellingProducts && stats.topSellingProducts.length > 0" class="space-y-3">
          <li v-for="(item, index) in stats.topSellingProducts" :key="item.productoId" class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="font-bold text-gray-400">{{ index + 1 }}</span>
              <span class="text-gray-700 dark:text-gray-300">{{ item.producto ? item.producto.nombre : 'N/A' }}</span>
            </div>
            <span class="font-bold bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{{ item.totalVendido }}</span>
          </li>
        </ul>
        <p v-else class="text-gray-500 dark:text-gray-400 text-center py-8">No hay datos de ventas.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import apiClient from '../services/api';
import { useThemeStore } from '../stores/theme';
import Chart from 'chart.js/auto';

const loading = ref(true);
const stats = ref(null);
const salesChartCanvas = ref(null);
const themeStore = useThemeStore();
let chartInstance = null;

const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0);

const getChartOptions = () => {
    const isDark = themeStore.theme === 'dark';
    return {
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: isDark ? '#9ca3af' : '#6b7280' },
                grid: { color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }
            },
            x: {
                ticks: { color: isDark ? '#9ca3af' : '#6b7280' },
                grid: { color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }
            }
        },
        plugins: {
            legend: { labels: { color: isDark ? '#e5e7eb' : '#374151' } }
        },
        responsive: true,
        maintainAspectRatio: false
    };
};

const renderChart = () => {
    if (chartInstance) {
        chartInstance.destroy();
    }
    if (salesChartCanvas.value && stats.value?.salesLast7Days) {
        const ctx = salesChartCanvas.value.getContext('2d');
        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: stats.value.salesLast7Days.map(d => d.date),
                datasets: [{
                    label: 'Ventas ($)',
                    data: stats.value.salesLast7Days.map(d => d.total),
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                }]
            },
            options: getChartOptions()
        });
    }
};

const fetchStats = async () => {
    try {
        loading.value = true;
        const response = await apiClient.get('/dashboard');
        stats.value = response.data;
        await nextTick();
        renderChart();
    } catch (error) {
        console.error("Error al cargar el dashboard:", error);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchStats);
watch(() => themeStore.theme, renderChart);
onBeforeUnmount(() => { 
    if (chartInstance) chartInstance.destroy(); 
});
</script>