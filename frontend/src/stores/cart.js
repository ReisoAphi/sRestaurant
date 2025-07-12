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
    // El subtotal, impuestos y total ahora se calculan en base al precio final de cada item, que ya incluye extras.
    const subtotal = computed(() => items.value.reduce((acc, item) => acc + (parseFloat(item.precio) * item.cantidad), 0));
    const impuestos = computed(() => subtotal.value * 0.16);
    const total = computed(() => subtotal.value + impuestos.value);

    // Añade un producto con su personalización
    function addItem(producto, personalizacion) {
        // La clave única ahora depende de la personalización para agrupar items idénticos
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

    async function submitPedido() {
        if (items.value.length === 0) return false;
        
        const pedidoBody = {
            mesa_nombre: mesaNombre.value,
            detalles: items.value.map(item => ({ 
                productoId: item.id, 
                cantidad: item.cantidad,
                personalizacion: item.personalizacion
            }))
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
            detalles: items.value.map(item => ({ 
                productoId: item.id, 
                cantidad: item.cantidad,
                personalizacion: item.personalizacion
            })),
            estado: 'en validacion'
        };
        const response = await apiClient.post('/pedidos', pedidoBody);
        resetCart();
        return response.data;
    }

   function resetCart() {
        items.value = [];
        mesaNombre.value = '';
    }

    function clearConsumerOrder() {
        consumerOrderId.value = null;
        localStorage.removeItem('consumerOrderId');
    }

    return {
        items, mesaNombre, totalItems, subtotal, impuestos, total,
        consumerOrderId, addItem, removeItem, updateQuantity,
        submitPedido, submitWaiterPedido, resetCart, clearConsumerOrder
    };
});