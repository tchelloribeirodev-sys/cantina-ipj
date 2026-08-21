import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon-32x32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Cantina IPJ',
        short_name: 'Cantina',
        description: 'Sistema de controle da cantina do acampamento',
        theme_color: '#3157d5',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Cacheia o "app shell" (HTML/JS/CSS/ícones) pra abrir rápido mesmo
        // com internet ruim. Os dados continuam vindo do Supabase em tempo
        // real — isso só acelera o carregamento da interface em si.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
      },
    }),
  ],
});
