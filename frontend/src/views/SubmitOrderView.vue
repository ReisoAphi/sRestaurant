<template>
  <div class="max-w-lg mx-auto">
    <CartComponent @submit-order="handleSubmit" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import apiClient from '../services/api';
import CartComponent from '../components/CartComponent.vue';

const cart = useCartStore();
const router = useRouter();

const handleSubmit = async (mesa) => {
    if (cart.items.length === 0) {
        alert("El carrito está vacío.");
        return;
    }
    if (!mesa) {
        alert("Por favor, ingresa el nombre de la mesa.");
        return;
    }

    const pedido = {
        mesa_nombre: mesa,
        detalles: cart.items.map(item => ({
            productoId: item.id,
            cantidad: item.cantidad,
            precio_unitario: item.precio
        }))
    };

    try {
        const response = await apiClient.post('/pedidos', pedido);
        cart.setConsumerOrderId(response.data.id);
        cart.clearCart();
        router.push('/mesero');
        alert(`Pedido #${response.data.id} creado con éxito.`);
    } catch (error) {
        console.error("Error al crear el pedido:", error);
        alert(error.response?.data?.message || 'No se pudo crear el pedido.');
    }
};
</script>