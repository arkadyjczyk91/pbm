import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png'],
            manifest: {
                name: 'Śledzenie Finansów',
                short_name: 'FinTracker',
                description: 'Aplikacja do zarządzania budżetem osobistym',
                theme_color: '#3f51b5',
                background_color: '#ffffff',
                display: 'standalone',
                scope: '/pbm/',
                start_url: '/pbm/',
                orientation: 'portrait',
                icons: [
                    {
                        src: '/pbm/favicon.ico',
                        sizes: '64x64',
                        type: 'image/x-icon'
                    },
                    {
                        src: '/pbm/logo192.png',
                        type: 'image/png',
                        sizes: '192x192',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/pbm/logo512.png',
                        type: 'image/png',
                        sizes: '512x512',
                        purpose: 'any maskable'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 rok
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /.*/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'default-cache',
                            networkTimeoutSeconds: 10,
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24 * 30
                            }
                        }
                    }
                ]
            }
        })
    ],
    base: '/pbm/'
});