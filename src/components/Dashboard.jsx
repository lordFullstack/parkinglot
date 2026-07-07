// src/components/Dashboard.jsx
import React from 'react';
import { useParking } from '../context/ParkingContext';
import SemaforoBadge from './SemaforoBadge';
import { formatCOP, formatHora } from '../utils/dateUtils';
import { getCodigoPuesto } from '../utils/puestoUtils';

function SummaryCard({ label, value, sub, accent }) {
  return (
    <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-4 flex-1 min-w-[140px]">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent || 'text-slate-100'}`}>{value}</p>
      {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const {
    settings,
    movimientosHoy,
    totalVentasHoy,
    puestosOcupados,
    totalPuestos,
    resumenPorSeccion,
    puestos,
  } = useParking();

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">{settings.nombreEmpresa}</h1>
          {settings.nit && <p className="text-xs text-slate-500">NIT {settings.nit}</p>}
        </div>
        <span className="text-xs text-slate-500">
          {new Date().toLocaleDateString('es-CO', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </span>
      </header>

      {/* Tarjetas resumen */}
      <div className="flex flex-wrap gap-3">
        <SummaryCard
          label="Ventas de hoy"
          value={formatCOP(totalVentasHoy)}
          sub={`${movimientosHoy.length} movimiento(s)`}
          accent="text-emerald-400"
        />
        <SummaryCard
          label="Puestos ocupados"
          value={`${puestosOcupados} / ${totalPuestos}`}
          sub={`Cubierta ${resumenPorSeccion.cubierta.ocupados}/${resumenPorSeccion.cubierta.total} · Normal ${resumenPorSeccion.normal.ocupados}/${resumenPorSeccion.normal.total}`}
        />
      </div>

      {/* Movimientos de hoy */}
      <section>
        <h2 className="text-base font-semibold text-slate-100 mb-3">Movimientos de hoy</h2>

        {movimientosHoy.length === 0 ? (
          <p className="text-sm text-slate-500 rounded-lg border border-dashed border-slate-700 p-4 text-center">
            Todavía no hay movimientos registrados hoy.
          </p>
        ) : (
          <div className="rounded-xl border border-slate-700 divide-y divide-slate-800 overflow-hidden">
            {movimientosHoy.map((m) => {
              const puesto = puestos.find((p) => p.id === m.puestoId);
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 bg-slate-800/40 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm text-slate-100 truncate">{m.placa}</p>
                    <p className="text-[11px] text-slate-500">
                      {puesto ? getCodigoPuesto(puesto) : `Puesto ${m.puestoId}`} · {formatHora(m.hora)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <SemaforoBadge
                      fechaFin={puesto?.fechaFin}
                      treatNullAsAlDia={!!puesto}
                    />
                    <span className="text-sm font-semibold text-slate-100">
                      {formatCOP(m.monto)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
