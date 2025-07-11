/** @type {import('tailwindcss').Config} */
export default {
  // Le decimos a Tailwind que busque clases en todos nuestros archivos .vue y .js
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  
  // ¡ESTA ES LA LÍNEA CLAVE QUE FALTABA!
  // Activa el modo oscuro basado en una clase en el elemento HTML.
  darkMode: 'class',

  theme: {
    extend: {},
  },
  plugins: [],
}