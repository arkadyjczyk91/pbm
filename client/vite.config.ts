import { VitePWA } from 'vite-plugin-pwa';
import {defineConfig} from "vite";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      filename: 'service-worker.js',
      base: '/pbm/',
      // ... inne opcje
    })
  ],
  base: '/pbm/',
});