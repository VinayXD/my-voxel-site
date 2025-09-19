import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // or '@vitejs/plugin-react-swc'

export default defineConfig(({ mode }) => {
  const base = mode === 'production' ? '/my-voxel-site/' : '/'
  return {
    base,         // or set base: './' if you prefer the simple Pages-safe option
    plugins: [react()],
  }
})
