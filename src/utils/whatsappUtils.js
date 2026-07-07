// src/utils/whatsappUtils.js

/**
 * Normaliza un número de teléfono colombiano a formato internacional
 * sin '+' ni espacios, como lo requiere wa.me (ej: 573001234567).
 */
export function normalizarTelefono(telefono) {
  if (!telefono) return '';
  const soloDigitos = telefono.replace(/\D/g, '');

  if (soloDigitos.startsWith('57') && soloDigitos.length >= 12) {
    return soloDigitos;
  }
  // Celular colombiano típico: 10 dígitos empezando en 3
  if (soloDigitos.length === 10) {
    return `57${soloDigitos}`;
  }
  return soloDigitos;
}

/**
 * Construye un link de wa.me listo para abrir WhatsApp con un mensaje
 * pre-escrito. Devuelve null si el teléfono no es válido.
 */
export function buildWhatsAppLink(telefono, mensaje) {
  const numero = normalizarTelefono(telefono);
  if (!numero) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

/**
 * Abre WhatsApp en una pestaña nueva con el mensaje dado.
 * Devuelve false si el teléfono no era válido (para poder avisar en la UI).
 */
export function abrirWhatsApp(telefono, mensaje) {
  const link = buildWhatsAppLink(telefono, mensaje);
  if (!link) return false;
  window.open(link, '_blank', 'noopener,noreferrer');
  return true;
}
