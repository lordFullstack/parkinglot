// src/hooks/useOcupacionHistorial.js
import { useMemo } from 'react';
import { getTodayISO } from '../utils/dateUtils';

const NOMBRES_DIA = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const NOMBRES_MES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

/**
 * Convierte el log de eventos (ingreso/salida) en tres series listas para graficar.
 * Mide "vehículos ingresados" como proxy de ocupación/tráfico por periodo,
 * ya que reconstruir la ocupación instantánea exacta requeriría un snapshot
 * continuo que no se guarda (para no inflar el localStorage).
 */
export default function useOcupacionHistorial(eventos) {
  return useMemo(() => {
    const ingresos = eventos.filter((e) => e.tipo === 'ingreso');

    // ---- Diario: ingresos por hora de HOY ----
    const hoy = getTodayISO();
    const ingresosHoy = ingresos.filter((e) => e.fecha === hoy);
    const diario = Array.from({ length: 24 }, (_, hora) => {
      const cantidad = ingresosHoy.filter((e) => new Date(e.hora).getHours() === hora).length;
      return { label: `${String(hora).padStart(2, '0')}h`, ingresos: cantidad };
    });

    // ---- Semanal: ingresos por día, últimos 7 días ----
    const semanal = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const fechaISO = d.toISOString().split('T')[0];
      const cantidad = ingresos.filter((e) => e.fecha === fechaISO).length;
      return { label: NOMBRES_DIA[d.getDay()], ingresos: cantidad, fecha: fechaISO };
    });

    // ---- Anual: ingresos por mes, últimos 12 meses ----
    const anual = Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      const anio = d.getFullYear();
      const mes = d.getMonth();
      const cantidad = ingresos.filter((e) => {
        const ed = new Date(e.hora);
        return ed.getFullYear() === anio && ed.getMonth() === mes;
      }).length;
      return { label: NOMBRES_MES[mes], ingresos: cantidad };
    });

    return { diario, semanal, anual };
  }, [eventos]);
}
