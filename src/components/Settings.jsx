// src/components/Settings.jsx
import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext';

function archivoABase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Settings() {
  const { settings, setSettings } = useParking();
  const [guardado, setGuardado] = useState(false);

  const handleChange = (campo) => (e) => {
    setSettings((prev) => ({ ...prev, [campo]: e.target.value }));
    setGuardado(false);
  };

  const handleLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await archivoABase64(file);
    setSettings((prev) => ({ ...prev, logoBase64: base64 }));
    setGuardado(false);
  };

  const handleQuitarLogo = () => {
    setSettings((prev) => ({ ...prev, logoBase64: '' }));
  };

  return (
    <section className="space-y-5">
      <h2 className="text-base font-semibold text-slate-100">Ajustes del parqueadero</h2>

      <label className="block text-sm text-slate-400">
        Nombre del parqueadero
        <input
          type="text"
          value={settings.nombreEmpresa || ''}
          onChange={handleChange('nombreEmpresa')}
          className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </label>

      <label className="block text-sm text-slate-400">
        NIT
        <input
          type="text"
          value={settings.nit || ''}
          onChange={handleChange('nit')}
          className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </label>

      <div>
        <p className="text-sm text-slate-400 mb-2">Logotipo (aparece en las cotizaciones PDF)</p>

        {settings.logoBase64 ? (
          <div className="flex items-center gap-3">
            <img
              src={settings.logoBase64}
              alt="Logo del parqueadero"
              className="h-16 w-16 rounded-lg object-contain bg-white/5 border border-slate-700"
            />
            <button
              onClick={handleQuitarLogo}
              className="text-xs text-red-400 border border-red-500/40 rounded-lg px-3 py-1.5"
            >
              Quitar logo
            </button>
          </div>
        ) : (
          <label className="flex items-center justify-center rounded-lg border border-dashed border-slate-700 py-6 text-sm text-slate-500 cursor-pointer">
            Toca para subir un logo (PNG o JPG)
            <input type="file" accept="image/png,image/jpeg" onChange={handleLogo} className="hidden" />
          </label>
        )}
      </div>

      <button
        onClick={() => setGuardado(true)}
        className="w-full rounded-lg bg-emerald-500/90 hover:bg-emerald-500 text-white font-medium py-3 transition-colors"
      >
        {guardado ? 'Guardado ✓' : 'Guardar cambios'}
      </button>
      <p className="text-[11px] text-slate-500 text-center">
        Los cambios se guardan solos en este dispositivo (localStorage); este botón solo confirma.
      </p>
    </section>
  );
}
