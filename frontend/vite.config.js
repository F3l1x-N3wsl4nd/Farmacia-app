import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', //  garante que os assets sejam carregados localmente
  plugins: [react()],
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
  },
})
