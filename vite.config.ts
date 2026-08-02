import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative production paths work at both the temporary /classcade/ Pages URL
  // and the final apex-domain root, while local Vite development stays at root.
  base: process.env.GITHUB_ACTIONS ? './' : '/',
  plugins: [react()],
})
