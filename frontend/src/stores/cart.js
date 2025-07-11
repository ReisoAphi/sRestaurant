// src/stores/cart.js
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';
import apiClient from '../services/api';

export const useCartStore = defineStore('cart', () => {
    const router = useRouter();
    const items = ref([]);
    const mesaNombre = ref('Cliente');
    const consumerOrderId = ref(localStorage.getItem('consumerOrderId') || null);

    const subtotal = computed(() => items.value.reduce((acc, item) => acc + (parseFloat(item.precio) * item.cantidad), 0));
    const impuestos = computed(() => subtotal.value * 0.16);
    const total = computed(() => subtotal.value + impuestos.value);
    const totalItems = computed(() => items.value.reduce((acc, item) => acc + item.cantidad, 0));

    function addItem(producto) {
        const existingItem = items.value.find(item => item.id === producto.id);
        if (existingItem) {
            existingItem.cantidad++;
        } else {
            items.value.push({ ...producto, cantidad: 1 });
        }
    }

    function removeItem(productoId) {
        items.value = items.value.filter(item => item.id !== productoId);
    }

    function updateQuantity(productoId, cantidad) {
        const item = items.value.find(i => i.id === productoId);
        if (item) {
            if (cantidad > 0) {
                item.cantidad = parseInt(cantidad, 10);
            } else {
                removeItem(productoId);
            }
        }
    }

    async function submitPedido() {
        if (items.value.length === 0) return false;
        const pedidoBody = {
            mesa_nombre: mesaNombre.value,
            detalles: items.value.map(item => ({ productoId: item.id, cantidad: item.cantidad }))
        };
        const response = await apiClient.post('/pedidos', pedidoBody);
        const newOrderId = response.data.id;
        consumerOrderId.value = newOrderId;
        localStorage.setItem('consumerOrderId', newOrderId);
        resetCart();
        router.push('/mi-pedido');
        return true;
    }

    async function submitWaiterPedido() {
        if (items.value.length === 0) return false;
        const pedidoBody = {
            mesa_nombre: mesaNombre.value,
            detalles: items.value.map(item => ({ productoId: item.id, cantidad: item.cantidad })),
            estado: 'en validacion'
        };
        const response = await apiClient.post('/pedidos', pedidoBody);
        resetCart();
        return response.data; // Devolver el pedido completo
    }

    function resetCart() {
        items.value = [];
    }

    function clearConsumerOrder() {
        consumerOrderId.value = null;
        localStorage.removeItem('consumerOrderId');
    }

    return {
        items,
        mesaNombre,
        totalItems,
        subtotal,
        impuestos,
        total,
        consumerOrderId,
        addItem,
        removeItem,
        updateQuantity,
        submitPedido,
        submitWaiterPedido,
        resetCart,
        clearConsumerOrder
    };
});