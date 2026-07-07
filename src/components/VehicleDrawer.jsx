// src/components/VehicleDrawer.jsx
import React, { useState, useEffect } from 'react';
import { useParking } from '../context/ParkingContext';
import SemaforoBadge from './SemaforoBadge';
import { formatCOP } from '../utils/dateUtils';
import { getCodigoPuesto, getNombreSeccion } from '../utils/puestoUtils';

export default function VehicleDrawer({ puesto, onClose }) {
  const { registrarIngreso, liberarPuesto, clientes } = useParking();

  const [placa, setPlaca] = useState('');
  const [tipo, setTipo] = useState('eventual'); // 'eventual' | 'mensual'
  const [clienteId, setClienteId] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [monto, setMonto] = useState('');

  // Reset del formulario cada vez que se abre un puesto distinto
  useEffect(() => {
    setPlaca('');
    setTipo('eventual');
    setClienteId('');
    setNombreCliente('');
    setFechaFin('');
    setMonto('');
  }, [puesto?.id]);

  if (!puesto) return null;

  const clientesMensuales = clientes.filter((c) => c.tipo === 'mensual');

  const handleClienteExistenteChange = (id) => {
    setClienteId(id);
    const c = clientesMensuales.find((cl) => String(cl.id) === String(id));
    if (c) {
      setNombreCliente(c.nombre);
      setFechaFin(c.fechaFin);
    }
  };

  const handleRegistrar = () => {
    if (!placa.trim()) return;
    if (tipo === 'mensual' && !clienteId && !fechaFin) return; // requiere fecha fin si es cliente nuevo

    registrarIngreso({
      puestoId: puesto.id,
      placa: placa.trim(),
      tipo,
      clienteId: clienteId ? Number(clienteId) : null,
      nombreCliente: nombreCliente.trim(),
      fechaFin: tipo === 'mensual' ? fechaFin : null,
      monto: monto ? Number(monto) : 0,
    });
    onClose();
  };

  const handleLiberar = () => {
    liberarPuesto(puesto.id, monto ? Number(monto) : 0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* backdrop */}
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* panel */}
      <div className="relative w-full max-w-md rounded-t-2xl bg-slate-900 border-t border-slate-700 p-5 pb-8 shadow-2xl animate-[slideUp_0.2s_ease-out]">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-700" />

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">{getCodigoPuesto(puesto)}</h2>
            <p className="text-[11px] text-slate-500">{getNombreSeccion(puesto.seccion)}</p>
          </div>
          {puesto.ocupado ? (
            <SemaforoBadge fechaFin={puesto.fechaFin} treatNullAsAlDia size="md" />
          ) : (
            <span className="text-xs text-slate-500">Disponible</span>
          )}
        </div>

        {puesto.ocupado ? (
          // ---- Vista de LIBERAR puesto ----
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-800/60 p-3 text-sm text-slate-300">
              <p>
                Placa: <span className="font-mono text-slate-100">{puesto.placa}</span>
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Tipo: {puesto.tipo === 'mensual' ? 'Cliente mensual' : 'Eventual / por hora'}
              </p>
            </div>

            <label className="block text-sm text-slate-400">
              Cobro al liberar (opcional)
              <input
                type="number"
                inputMode="numeric"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0"
                className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </label>

            <button
              onClick={handleLiberar}
              className="w-full rounded-lg bg-red-500/90 hover:bg-red-500 text-white font-medium py-3 transition-colors"
            >
              Liberar puesto
            </button>
          </div>
        ) : (
          // ---- Vista de REGISTRAR ingreso ----
          <div className="space-y-4">
            <label className="block text-sm text-slate-400">
              Placa
              <input
                type="text"
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                placeholder="ABC-123"
                className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTipo('eventual')}
                className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                  tipo === 'eventual'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                    : 'border-slate-700 text-slate-400'
                }`}
              >
                Eventual
              </button>
              <button
                type="button"
                onClick={() => setTipo('mensual')}
                className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                  tipo === 'mensual'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                    : 'border-slate-700 text-slate-400'
                }`}
              >
                Mensual
              </button>
            </div>

            {tipo === 'mensual' && (
              <>
                <label className="block text-sm text-slate-400">
                  Cliente existente (opcional)
                  <select
                    value={clienteId}
                    onChange={(e) => handleClienteExistenteChange(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Nuevo cliente --</option>
                    {clientesMensuales.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                {!clienteId && (
                  <label className="block text-sm text-slate-400">
                    Nombre del cliente
                    <input
                      type="text"
                      value={nombreCliente}
                      onChange={(e) => setNombreCliente(e.target.value)}
                      className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </label>
                )}

                <label className="block text-sm text-slate-400">
                  Fecha fin de contrato
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    disabled={!!clienteId}
                    className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                  />
                </label>
              </>
            )}

            <label className="block text-sm text-slate-400">
              Cobro al ingreso (opcional)
              <input
                type="number"
                inputMode="numeric"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0"
                className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </label>

            <button
              onClick={handleRegistrar}
              disabled={!placa.trim() || (tipo === 'mensual' && !clienteId && !fechaFin)}
              className="w-full rounded-lg bg-emerald-500/90 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 transition-colors"
            >
              Registrar ingreso
            </button>
          </div>
        )}

        {monto !== '' && (
          <p className="mt-2 text-center text-xs text-slate-500">{formatCOP(Number(monto))}</p>
        )}
      </div>
    </div>
  );
}
