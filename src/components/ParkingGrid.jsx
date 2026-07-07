// src/components/ParkingGrid.jsx
import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext';
import useParkingStatus from '../hooks/useParkingStatus';
import VehicleDrawer from './VehicleDrawer';

function PuestoButton({ puesto, onSelect }) {
  // Si está libre no hay fechaFin -> estado 'libre' (gris).
  // Si está ocupado, treatNullAsAlDia cubre el caso de clientes eventuales sin contrato.
  const { bg, border, text } = useParkingStatus(puesto.fechaFin, {
    treatNullAsAlDia: puesto.ocupado,
  });

  const baseClasses = puesto.ocupado
    ? `${bg} ${border} ${text} border-2`
    : 'bg-slate-800/40 border-2 border-dashed border-slate-700 text-slate-500';

  return (
    <button
      onClick={() => onSelect(puesto)}
      className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-transform active:scale-95 ${baseClasses}`}
    >
      <span className="text-sm font-bold">{String(puesto.id).padStart(2, '0')}</span>
      {puesto.ocupado && (
        <span className="text-[9px] font-mono truncate max-w-[90%]">{puesto.placa}</span>
      )}
    </button>
  );
}

export default function ParkingGrid() {
  const { puestos } = useParking();
  const [puestoSeleccionado, setPuestoSeleccionado] = useState(null);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-slate-100">Puestos</h2>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Al día
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Por vencer
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" /> Mora
          </span>
        </div>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {puestos.map((puesto) => (
          <PuestoButton key={puesto.id} puesto={puesto} onSelect={setPuestoSeleccionado} />
        ))}
      </div>

      {puestoSeleccionado && (
        <VehicleDrawer
          puesto={puestos.find((p) => p.id === puestoSeleccionado.id) || puestoSeleccionado}
          onClose={() => setPuestoSeleccionado(null)}
        />
      )}
    </section>
  );
}
