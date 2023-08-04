import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/MOSAIC',
  resolve:{
    alias:{
      '@': resolve(__dirname, 'src'),
      '#root': resolve(__dirname)
    }
  }
})
