// src/App.jsx
import React, { useState } from 'react';
import { ParkingProvider } from './context/ParkingContext';
import Dashboard from './components/Dashboard';
import ParkingGrid from './components/ParkingGrid';
import Herramientas from './components/Herramientas';
import Settings from './components/Settings';

const TABS = [
  { key: 'dashboard', label: 'Resumen' },
  { key: 'grid', label: 'Puestos' },
  { key: 'herramientas', label: 'Herramientas' },
  { key: 'ajustes', label: 'Ajustes' },
];

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg py-2.5 text-[13px] font-medium transition-colors ${
        active ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-500'
      }`}
    >
      {children}
    </button>
  );
}

function AppShell() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      <main className="max-w-4xl mx-auto px-4 pt-6">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'grid' && <ParkingGrid />}
        {tab === 'herramientas' && <Herramientas />}
        {tab === 'ajustes' && <Settings />}
      </main>

      {/* Bottom nav, pensado para uso desde el celular */}
      <nav className="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur border-t border-slate-800">
        <div className="max-w-4xl mx-auto flex gap-1 p-2">
          {TABS.map((t) => (
            <TabButton key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>
              {t.label}
            </TabButton>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <ParkingProvider>
      <AppShell />
    </ParkingProvider>
  );
}
