// src/utils/puestoUtils.js

/**
 * Devuelve el código visible de un puesto, ej: "C-05" (cubierta) o "N-12" (normal).
 */
export function getCodigoPuesto(puesto) {
  const prefijo = puesto.seccion === 'cubierta' ? 'C' : 'N';
  return `${prefijo}-${String(puesto.numero).padStart(2, '0')}`;
}

export function getNombreSeccion(seccion) {
  return seccion === 'cubierta' ? 'Cubierta' : 'Normal';
}
