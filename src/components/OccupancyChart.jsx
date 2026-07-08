// src/components/OccupancyChart.jsx
import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useParking } from '../context/ParkingContext';
import useIngresosHistorial from '../hooks/useIngresosHistorial';
import { formatCOP } from '../utils/dateUtils';

const PERIODOS = [
  { key: 'diario', label: 'Diario' },
  { key: 'semanal', label: 'Semanal' },
  { key: 'anual', label: 'Anual' },
];

// Formato corto para el eje Y: 15000 -> "15k", 2500000 -> "2.5M"
function formatCOPCorto(valor) {
  if (valor >= 1_000_000) return `${(valor / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (valor >= 1_000) return `${Math.round(valor / 1_000)}k`;
  return `${valor}`;
}

export default function OccupancyChart() {
  const { movimientos } = useParking();
  const { diario, semanal, anual } = useIngresosHistorial(movimientos);
  const [periodo, setPeriodo] = useState('semanal');

  const data = { diario, semanal, anual }[periodo];
  const totalPeriodo = data.reduce((sum, d) => sum + d.monto, 0);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-slate-100">Ventas 📈</h2>
        <span className="text-[11px] text-slate-500">{formatCOP(totalPeriodo)}</span>
      </div>

      <div className="flex gap-1 mb-4 rounded-lg bg-slate-800/60 p-1">
        {PERIODOS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriodo(p.key)}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              periodo === p.key
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'text-slate-500'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-3">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
              interval={periodo === 'diario' ? 2 : 0}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={formatCOPCorto}
            />
            <Tooltip
              contentStyle={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value) => [formatCOP(value), 'Ventas']}
            />
            <Line
              type="monotone"
              dataKey="monto"
              stroke="#eab308"
              strokeWidth={2}
              dot={{ r: 2, fill: '#eab308' }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[11px] text-slate-500 mt-2">
        Suma de cobros registrados (ingresos/salidas con monto) por periodo. Solo cuenta
        movimientos guardados desde que activaste esta función.
      </p>
    </section>
  );
}
