// src/components/Herramientas.jsx
import React, { useState } from 'react';
import OccupancyChart from './OccupancyChart';
import QuoteGenerator from './QuoteGenerator';
import ReminderPanel from './ReminderPanel';

const SUBTABS = [
  { key: 'ventas', label: 'Ventas' },
  { key: 'cotizar', label: 'Cotizar' },
  { key: 'recordatorios', label: 'Recordatorios' },
];

export default function Herramientas() {
  const [sub, setSub] = useState('ventas');

  return (
    <div>
      <div className="flex gap-1 mb-5 rounded-lg bg-slate-800/60 p-1">
        {SUBTABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setSub(t.key)}
            className={`flex-1 rounded-md py-2 text-xs font-medium transition-colors ${
              sub === t.key ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === 'ventas' && <OccupancyChart />}
      {sub === 'cotizar' && <QuoteGenerator />}
      {sub === 'recordatorios' && <ReminderPanel />}
    </div>
  );
}
