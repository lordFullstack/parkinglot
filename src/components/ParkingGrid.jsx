// src/components/ParkingGrid.jsx
import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext';
import useParkingStatus from '../hooks/useParkingStatus';
import { getCodigoPuesto } from '../utils/puestoUtils';
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
      <span className="text-sm font-bold">{getCodigoPuesto(puesto)}</span>
      {puesto.ocupado && (
        <span className="text-[9px] font-mono truncate max-w-[90%]">{puesto.placa}</span>
      )}
    </button>
  );
}

function SeccionGrid({ titulo, puestos, resumen, onSelect }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-200">{titulo}</h3>
        <span className="text-[11px] text-slate-500">
          {resumen.ocupados} / {resumen.total} ocupados
        </span>
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {puestos.map((puesto) => (
          <PuestoButton key={puesto.id} puesto={puesto} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

export default function ParkingGrid() {
  const { puestos, resumenPorSeccion } = useParking();
  const [puestoSeleccionado, setPuestoSeleccionado] = useState(null);

  const puestosCubierta = puestos.filter((p) => p.seccion === 'cubierta');
  const puestosNormal = puestos.filter((p) => p.seccion === 'normal');

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

      <SeccionGrid
        titulo="Cubierta"
        puestos={puestosCubierta}
        resumen={resumenPorSeccion.cubierta}
        onSelect={setPuestoSeleccionado}
      />

      <SeccionGrid
        titulo="Normal"
        puestos={puestosNormal}
        resumen={resumenPorSeccion.normal}
        onSelect={setPuestoSeleccionado}
      />

      {puestoSeleccionado && (
        <VehicleDrawer
          puesto={puestos.find((p) => p.id === puestoSeleccionado.id) || puestoSeleccionado}
          onClose={() => setPuestoSeleccionado(null)}
        />
      )}
    </section>
  );
}
