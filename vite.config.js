import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IMPORTANTE: "base" debe coincidir con el nombre de tu repositorio en GitHub.
// Si tu repo se llama "parqueadero" y lo publicas en
// https://<usuario>.github.io/parqueadero/  deja esto tal cual.
// Si le pones otro nombre al repo, cambia el valor aquí abajo.
export default defineConfig({
  plugins: [react()],
  base: '/parkinglot/',
});
