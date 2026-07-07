// src/components/SemaforoBadge.jsx
import React from 'react';
import useParkingStatus from '../hooks/useParkingStatus';

/**
 * Pequeña píldora de estado. Recibe fechaFin y calcula el semáforo
 * en el momento del render (derived state).
 */
export default function SemaforoBadge({ fechaFin, treatNullAsAlDia = false, size = 'sm' }) {
  const { label, bg, text, border, diasRestantes } = useParkingStatus(fechaFin, {
    treatNullAsAlDia,
  });

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${border} ${bg} ${text} ${padding} font-medium whitespace-nowrap`}
      title={
        diasRestantes === null
          ? 'Sin contrato asociado'
          : diasRestantes < 0
          ? `Vencido hace ${Math.abs(diasRestantes)} día(s)`
          : `Vence en ${diasRestantes} día(s)`
      }
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
