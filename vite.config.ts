import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { briefApiPlugin } from './server/briefPlugin.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), briefApiPlugin()],
  }
})
