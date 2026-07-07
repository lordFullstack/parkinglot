// src/hooks/useParkingStatus.js
import { useMemo } from 'react';
import { diffInDays } from '../utils/dateUtils';

// Umbral de días para pasar de "al-dia" a "retrasado"
const DIAS_ALERTA_RETRASO = 3;

const SEMAFORO = {
  'al-dia': {
    status: 'al-dia',
    color: 'verde',
    label: 'Al día',
    hex: '#22C55E',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500',
    text: 'text-emerald-400',
  },
  retrasado: {
    status: 'retrasado',
    color: 'amarillo',
    label: 'Por vencer',
    hex: '#F59E0B',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500',
    text: 'text-amber-400',
  },
  'en-mora': {
    status: 'en-mora',
    color: 'rojo',
    label: 'En mora',
    hex: '#EF4444',
    bg: 'bg-red-500/15',
    border: 'border-red-500',
    text: 'text-red-400',
  },
  libre: {
    status: 'libre',
    color: 'gris',
    label: 'Libre',
    hex: '#4B5563',
    bg: 'bg-slate-700/40',
    border: 'border-slate-600',
    text: 'text-slate-400',
  },
};

/**
 * useParkingStatus
 * Calcula en tiempo real (derived state, nunca persistido) el estado del
 * semáforo de un contrato a partir de su fechaFin ('YYYY-MM-DD').
 *
 * Si fechaFin es null/undefined (ej: puesto libre o cliente eventual sin
 * contrato) devuelve el estado 'libre' con color gris, salvo que se pase
 * treatNullAsAlDia = true, en cuyo caso se considera 'al-dia' (útil para
 * clientes "por hora" que sí ocupan un puesto pero no tienen contrato).
 *
 * @param {string|null} fechaFin - fecha límite del contrato, formato ISO YYYY-MM-DD
 * @param {object} [opts]
 * @param {boolean} [opts.treatNullAsAlDia=false]
 * @returns {{status: string, color: string, label: string, hex: string, bg: string, border: string, text: string, diasRestantes: number|null}}
 */
export default function useParkingStatus(fechaFin, opts = {}) {
  const { treatNullAsAlDia = false } = opts;

  return useMemo(() => {
    if (!fechaFin) {
      const base = treatNullAsAlDia ? SEMAFORO['al-dia'] : SEMAFORO.libre;
      return { ...base, diasRestantes: null };
    }

    const dias = diffInDays(fechaFin);

    let base;
    if (dias < 0) {
      base = SEMAFORO['en-mora'];
    } else if (dias <= DIAS_ALERTA_RETRASO) {
      base = SEMAFORO.retrasado;
    } else {
      base = SEMAFORO['al-dia'];
    }

    return { ...base, diasRestantes: dias };
  }, [fechaFin, treatNullAsAlDia]);
}

export { SEMAFORO };
