import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
  host: '0.0.0.0',  // Listen on all network interfaces
  port: 8075,        // Ensure the port is correct
  allowedHosts: [
      'financialtracker.skylim.local', // 👈 add your custom host here
    ],
    // host: true, // optional, allows access via network
  },
})