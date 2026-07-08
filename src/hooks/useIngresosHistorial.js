// src/hooks/useIngresosHistorial.js
import { useMemo } from 'react';
import { getTodayISO } from '../utils/dateUtils';

const NOMBRES_DIA = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const NOMBRES_MES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

/**
 * Agrega los movimientos (monto en COP) en tres series listas para graficar:
 * - diario: total por hora de HOY
 * - semanal: total por día, últimos 7 días
 * - anual: total por mes, últimos 12 meses
 */
export default function useIngresosHistorial(movimientos) {
  return useMemo(() => {
    const sumaMonto = (lista) => lista.reduce((sum, m) => sum + Number(m.monto || 0), 0);

    // ---- Diario: ventas por hora de HOY ----
    const hoy = getTodayISO();
    const movimientosHoy = movimientos.filter((m) => m.fecha === hoy);
    const diario = Array.from({ length: 24 }, (_, hora) => {
      const total = sumaMonto(
        movimientosHoy.filter((m) => new Date(m.hora).getHours() === hora)
      );
      return { label: `${String(hora).padStart(2, '0')}h`, monto: total };
    });

    // ---- Semanal: ventas por día, últimos 7 días ----
    const semanal = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const fechaISO = d.toISOString().split('T')[0];
      const total = sumaMonto(movimientos.filter((m) => m.fecha === fechaISO));
      return { label: NOMBRES_DIA[d.getDay()], monto: total, fecha: fechaISO };
    });

    // ---- Anual: ventas por mes, últimos 12 meses ----
    const anual = Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      const anio = d.getFullYear();
      const mes = d.getMonth();
      const total = sumaMonto(
        movimientos.filter((m) => {
          const md = new Date(m.hora);
          return md.getFullYear() === anio && md.getMonth() === mes;
        })
      );
      return { label: NOMBRES_MES[mes], monto: total };
    });

    return { diario, semanal, anual };
  }, [movimientos]);
}
