// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(),tailwindcss(),],
//    build: {
//     // Raise warning limit temporarily (500 → 1000 kB) to stop noise
//     chunkSizeWarningLimit: 1000,  // [web:1]
    
//     rollupOptions: {
//       output: {
//         // Split vendor libs into separate chunks
//         manualChunks: (id) => {
//           if (id.includes('node_modules')) {
//             // React + ecosystem
//             if (id.includes('react') || id.includes('@types/react')) return 'react-vendor'
//             // Charts/UI libs (common culprits)
//             if (id.includes('chart') || id.includes('recharts') || id.includes('ant')) return 'charts-ui'
//             // Utils (lodash/date-fns)
//             if (id.includes('lodash') || id.includes('date-fns')) return 'utils'
//             // Default vendor chunk
//             return 'vendor'
//           }
//         },
//         // Name chunks predictably
//         chunkFileNames: 'chunks/[name]-[hash].js',
//         entryFileNames: '[name]-[hash].js'
//       }
//     }}
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // or vue, etc.
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      open: true, // opens in browser after build
    }),
  ],
})
