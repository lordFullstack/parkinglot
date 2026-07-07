// src/components/ReminderPanel.jsx
import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext';
import { abrirWhatsApp } from '../utils/whatsappUtils';
import SemaforoBadge from './SemaforoBadge';

function mensajeRecordatorio({ nombre, codigo, estado, nombreEmpresa }) {
  const { status, diasRestantes } = estado;
  const situacion =
    status === 'en-mora'
      ? `tiene el arriendo vencido hace ${Math.abs(diasRestantes)} día(s)`
      : diasRestantes === 0
      ? 'el arriendo vence hoy'
      : `el arriendo está por vencer en ${diasRestantes} día(s)`;

  return (
    `Hola ${nombre}, te escribimos de ${nombreEmpresa}. ` +
    `Te recordamos que el puesto ${codigo} ${situacion}. ` +
    `Por favor comunícate con nosotros para ponerte al día. ¡Gracias!`
  );
}

function TelefonoFaltante({ item, onGuardar }) {
  const [valor, setValor] = useState('');
  return (
    <div className="flex gap-2 mt-2">
      <input
        type="tel"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder="Agregar teléfono"
        className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <button
        onClick={() => valor.trim() && onGuardar(item, valor.trim())}
        disabled={!valor.trim()}
        className="rounded-lg bg-slate-700 px-3 text-xs font-medium text-slate-200 disabled:opacity-40"
      >
        Guardar
      </button>
    </div>
  );
}

export default function ReminderPanel() {
  const { clientesEnAlerta, settings, actualizarCliente } = useParking();
  const [enviados, setEnviados] = useState({});

  const handleEnviar = (item) => {
    const mensaje = mensajeRecordatorio({
      nombre: item.nombre,
      codigo: item.codigo,
      estado: item.estado,
      nombreEmpresa: settings.nombreEmpresa,
    });
    const ok = abrirWhatsApp(item.telefono, mensaje);
    if (ok) setEnviados((prev) => ({ ...prev, [item.puestoId]: true }));
  };

  const handleGuardarTelefono = (item, telefono) => {
    if (item.clienteId) actualizarCliente(item.clienteId, { telefono });
  };

  const enMora = clientesEnAlerta.filter((i) => i.estado.status === 'en-mora');
  const porVencer = clientesEnAlerta.filter((i) => i.estado.status === 'retrasado');

  const Grupo = ({ titulo, items }) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">
          {titulo} <span className="text-slate-500 font-normal">({items.length})</span>
        </h3>
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.puestoId}
              className="rounded-xl border border-slate-700 bg-slate-800/40 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate">{item.nombre}</p>
                  <p className="text-[11px] text-slate-500">
                    {item.codigo} · {item.placa}
                  </p>
                </div>
                <SemaforoBadge fechaFin={item.fechaFin} />
              </div>

              {item.telefono ? (
                <button
                  onClick={() => handleEnviar(item)}
                  className={`mt-2 w-full rounded-lg py-2 text-xs font-medium transition-colors ${
                    enviados[item.puestoId]
                      ? 'bg-slate-700 text-slate-400'
                      : 'bg-emerald-500/90 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {enviados[item.puestoId] ? 'Recordatorio enviado ✓' : 'Enviar recordatorio por WhatsApp'}
                </button>
              ) : (
                <TelefonoFaltante item={item} onGuardar={handleGuardarTelefono} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section>
      <h2 className="text-base font-semibold text-slate-100 mb-3">Recordatorios</h2>

      {clientesEnAlerta.length === 0 ? (
        <p className="text-sm text-slate-500 rounded-lg border border-dashed border-slate-700 p-4 text-center">
          No hay clientes en mora ni por vencer. 🎉
        </p>
      ) : (
        <>
          <Grupo titulo="En mora" items={enMora} />
          <Grupo titulo="Por vencer" items={porVencer} />
        </>
      )}
    </section>
  );
}
