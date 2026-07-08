import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registra el service worker para que Chrome/Android reconozca la app como
// PWA instalable (requisito para que "Añadir a pantalla de inicio" use el
// ícono del manifest en vez de un acceso directo genérico).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/parkinglot/sw.js').catch((err) => {
      console.error('Error registrando el service worker:', err);
    });
  });
}
