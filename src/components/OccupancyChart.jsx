// src/components/OccupancyChart.jsx
import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useParking } from '../context/ParkingContext';
import useOcupacionHistorial from '../hooks/useOcupacionHistorial';

const PERIODOS = [
  { key: 'diario', label: 'Diario' },
  { key: 'semanal', label: 'Semanal' },
  { key: 'anual', label: 'Anual' },
];

export default function OccupancyChart() {
  const { eventos } = useParking();
  const { diario, semanal, anual } = useOcupacionHistorial(eventos);
  const [periodo, setPeriodo] = useState('semanal');

  const data = { diario, semanal, anual }[periodo];
  const totalPeriodo = data.reduce((sum, d) => sum + d.ingresos, 0);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-slate-100">Ocupación 📈</h2>
        <span className="text-[11px] text-slate-500">{totalPeriodo} ingresos</span>
      </div>

      <div className="flex gap-1 mb-4 rounded-lg bg-slate-800/60 p-1">
        {PERIODOS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriodo(p.key)}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              periodo === p.key
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-slate-500'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-3">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
              allowDecimals={false}
              width={28}
            />
            <Tooltip
              contentStyle={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value) => [`${value} vehículo(s)`, 'Ingresos']}
            />
            <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[11px] text-slate-500 mt-2">
        Mide vehículos que ingresaron por periodo (proxy de ocupación/tráfico). Solo cuenta
        movimientos registrados desde que activaste esta función.
      </p>
    </section>
  );
}
