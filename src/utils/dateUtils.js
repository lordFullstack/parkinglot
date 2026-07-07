// src/utils/dateUtils.js

/**
 * Devuelve la fecha de hoy como string 'YYYY-MM-DD' (hora local),
 * lista para comparar contra los campos "fecha" guardados en localStorage.
 */
export function getTodayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().split('T')[0];
}

/**
 * Diferencia en días completos entre fechaFin y hoy.
 * Positivo => fechaFin está en el futuro.
 * Negativo => fechaFin ya pasó (mora).
 */
export function diffInDays(fechaFinISO) {
  const hoy = new Date(getTodayISO() + 'T00:00:00');
  const fin = new Date(fechaFinISO + 'T00:00:00');
  const msPorDia = 1000 * 60 * 60 * 24;
  return Math.round((fin.getTime() - hoy.getTime()) / msPorDia);
}

/**
 * Formatea un monto numérico como pesos colombianos.
 */
export function formatCOP(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor || 0);
}

/**
 * Formatea una hora a partir de un timestamp ISO o de un objeto Date.
 */
export function formatHora(fechaISOConHora) {
  const d = new Date(fechaISOConHora);
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}
