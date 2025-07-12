// src/stores/cart.js
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';
import apiClient from '../services/api';

export const useCartStore = defineStore('cart', () => {
    const router = useRouter();
    const items = ref([]);
    const mesaNombre = ref(''); 
    const consumerOrderId = ref(localStorage.getItem('consumerOrderId') || null);

    const totalItems = computed(() => items.value.reduce((acc, item) => acc + item.cantidad, 0));
    const subtotal = computed(() => items.value.reduce((acc, item) => acc + (parseFloat(item.precio) * item.cantidad), 0));
    const impuestos = computed(() => subtotal.value * 0.16);
    const total = computed(() => subtotal.value + impuestos.value);

    function addItem(producto, personalizacion) {
        const personalizacionString = JSON.stringify({
            removidos: personalizacion.removidos.sort(),
            agregados: personalizacion.agregados.sort()
        });
        const itemKey = `${producto.id}-${personalizacionString}`;
        const existingItem = items.value.find(item => item.key === itemKey);

        if (existingItem) {
            existingItem.cantidad++;
        } else {
            items.value.push({ 
                ...producto, 
                cantidad: 1, 
                personalizacion,
                key: itemKey 
            });
        }
    }

    function removeItem(itemKey) {
        items.value = items.value.filter(item => item.key !== itemKey);
    }

    function updateQuantity(itemKey, cantidad) {
        const item = items.value.find(i => i.key === itemKey);
        if (item) {
            if (cantidad > 0) {
                item.cantidad = parseInt(cantidad, 10);
            } else {
                removeItem(itemKey);
            }
        }
    }
    
    function resetCart() {
        items.value = [];
        mesaNombre.value = '';
    }

    // ===== CORRECCIÓN PARA EL CLIENTE =====
    async function submitPedido() {
        if (items.value.length === 0) return;
        const pedidoBody = {
            mesa_nombre: mesaNombre.value || 'Cliente',
            detalles: items.value.map(item => ({
                productoId: item.id,
                cantidad: item.cantidad,
                personalizacion: item.personalizacion
            }))
        };
        try {
            const response = await apiClient.post('/pedidos', pedidoBody);
            const nuevoPedido = response.data;
            
            // 1. Guarda el ID del nuevo pedido para que la vista se actualice
            consumerOrderId.value = nuevoPedido.id;
            localStorage.setItem('consumerOrderId', nuevoPedido.id);

            // 2. Limpia el carrito
            resetCart();
            
            // 3. Redirige para asegurar que la vista se refresque
            router.push('/mi-pedido');
            return nuevoPedido;
        } catch (error) {
            console.error("Error al crear el pedido del cliente:", error);
            throw error;
        }
    }

    // ===== CORRECCIÓN PARA EL MESERO =====
    async function submitWaiterPedido() {
        if (items.value.length === 0) return null;
        const pedidoBody = {
            mesa_nombre: mesaNombre.value,
            detalles: items.value.map(item => ({
                productoId: item.id,
                cantidad: item.cantidad,
                personalizacion: item.personalizacion
            })),
            estado: 'en preparacion'
        };
        try {
            const response = await apiClient.post('/pedidos', pedidoBody);
            // Limpia el carrito después de un envío exitoso
            resetCart();
            // Devuelve los datos del nuevo pedido para que la vista los muestre
            return response.data;
        } catch (error) {
            console.error("Error al crear el pedido del mesero:", error);
            throw error;
        }
    }

    function clearConsumerOrder() {
        consumerOrderId.value = null;
        localStorage.removeItem('consumerOrderId');
        resetCart();
    }

    return {
        items, mesaNombre, totalItems, subtotal, impuestos, total,
        consumerOrderId, addItem, removeItem, updateQuantity,
        submitPedido, submitWaiterPedido, resetCart, clearConsumerOrder
    };
});