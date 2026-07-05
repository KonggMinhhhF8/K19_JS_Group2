import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.', // Set root to the workspace root
  server: {
    port: 5173,
    open: '/index.html', // Automatically open the main app page on startup
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        orders: resolve(__dirname, 'app/orders/index.html'),
        orderDetails: resolve(__dirname, 'app/orders/order-details.html'),
        orderForm: resolve(__dirname, 'app/orders/order-form.html'),
        products: resolve(__dirname, 'app/products/index.html'),
        productsCreate: resolve(__dirname, 'app/products/create.html'),
        reports: resolve(__dirname, 'app/reports/index.html'),
      }
    }
  }
});
