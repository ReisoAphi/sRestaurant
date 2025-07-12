// src/router/index.js

import { createRouter, createWebHashHistory } from 'vue-router';

// Importa los componentes de las Vistas.
// Es normal que el 'build' falle después, pidiendo que creemos estos archivos.
import TakeOrderView from '../views/TakeOrderView.vue';
import MyOrderView from '../views/MyOrderView.vue';
import DashboardView from '../views/DashboardView.vue';
import UserManagementView from '../views/UserManagementView.vue';
import MenuAdminView from '../views/MenuAdminView.vue';
import WaiterView from '../views/WaiterView.vue';
import WaiterOrderView from '../views/WaiterOrderView.vue';
import SubmitOrderView from '../views/SubmitOrderView.vue';
import KitchenView from '../views/KitchenView.vue';
import OrdersHistoryView from '../views/OrdersHistoryView.vue';
import SettingsView from '../views/SettingsView.vue';

const routes = [
  // --- Rutas Públicas ---
  {
    path: '/',
    component: TakeOrderView,
    meta: { title: 'Realizar Pedido' }
  },
  {
    path: '/mi-pedido',
    component: MyOrderView,
    meta: { title: 'Mi Pedido' }
  },

  // --- Rutas de Administrador ---
  {
    path: '/dashboard',
    component: DashboardView,
    meta: { title: 'Dashboard', requiresAuth: true, roles: ['administrador'] }
  },
  {
    path: '/users',
    component: UserManagementView,
    meta: { title: 'Gestión de Usuarios', requiresAuth: true, roles: ['administrador'] }
  },
  {
    path: '/menu-admin',
    component: MenuAdminView,
    meta: { title: 'Gestión de Menú', requiresAuth: true, roles: ['administrador'] }
  },
  {
    path: '/configuracion',
    component: SettingsView,
    meta: { title: 'Configuración', requiresAuth: true, roles: ['administrador'] }
  },

  // --- Rutas de Mesero y Administrador ---
  {
    path: '/mesero',
    component: WaiterView,
    meta: { title: 'Gestionar Pedidos', requiresAuth: true, roles: ['mesero', 'administrador'] }
  },
  {
    path: '/crear-pedido',
    component: WaiterOrderView,
    meta: { title: 'Crear Pedido', requiresAuth: true, roles: ['mesero', 'administrador'] }
  },
  {
    path: '/ingresar-pedido',
    component: SubmitOrderView,
    meta: { title: 'Ingresar Pedido', requiresAuth: true, roles: ['mesero', 'administrador'] }
  },
  {
    path: '/pedidos',
    component: OrdersHistoryView,
    meta: { title: 'Historial', requiresAuth: true, roles: ['mesero', 'administrador'] }
  },

  // --- Rutas de Cocinero y Administrador ---
  {
    path: '/cocina',
    component: KitchenView,
    meta: { title: 'Vista de Cocina', requiresAuth: true, roles: ['cocinero', 'administrador'] }
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;