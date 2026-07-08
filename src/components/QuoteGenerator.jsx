// src/components/QuoteGenerator.jsx
import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext';
import { generarCotizacionPDF } from '../utils/pdfUtils';
import { abrirWhatsApp } from '../utils/whatsappUtils';
import { formatCOP } from '../utils/dateUtils';

const HOY = new Date().toISOString().split('T')[0];

export default function QuoteGenerator() {
  const { settings } = useParking();

  const [nombreCliente, setNombreCliente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [seccion, setSeccion] = useState('cubierta');
  const [tipoContrato, setTipoContrato] = useState('mensual');
  const [tarifa, setTarifa] = useState('');
  const [vigenciaDesde, setVigenciaDesde] = useState(HOY);
  const [vigenciaHasta, setVigenciaHasta] = useState('');
  const [notas, setNotas] = useState('');
  const [aviso, setAviso] = useState('');

  const cotizacionValida = nombreCliente.trim() && tarifa;

  const construirCotizacion = () => ({
    nombreCliente: nombreCliente.trim(),
    telefono,
    seccion,
    tipoContrato,
    tarifa: Number(tarifa),
    vigenciaDesde,
    vigenciaHasta,
    notas: notas.trim(),
  });

  const handleDescargar = () => {
    if (!cotizacionValida) return;
    generarCotizacionPDF({ settings, cotizacion: construirCotizacion() });
  };

  const handleEnviarWhatsApp = () => {
    if (!cotizacionValida) return;
    generarCotizacionPDF({ settings, cotizacion: construirCotizacion() });

    const mensaje =
      `Hola ${nombreCliente.trim()}, te comparto la cotización de ${settings.nombreEmpresa} ` +
      `para un puesto ${seccion === 'cubierta' ? 'cubierto' : 'normal'} ` +
      `(${tipoContrato === 'mensual' ? 'arriendo mensual' : 'eventual'}) por ${formatCOP(
        Number(tarifa)
      )}${tipoContrato === 'mensual' ? '/mes' : ''}. ` +
      `Adjunto el PDF que se acaba de descargar. Cualquier duda, quedo atento(a).`;

    const abierto = abrirWhatsApp(telefono, mensaje);
    setAviso(
      abierto
        ? 'Se descargó el PDF y se abrió WhatsApp. Adjunta el archivo descargado al chat.'
        : 'Se descargó el PDF, pero el teléfono no es válido para abrir WhatsApp.'
    );
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-100">Cotizar arriendo</h2>
      </div>

      <label className="block text-sm text-slate-400">
        Nombre del cliente
        <input
          type="text"
          value={nombreCliente}
          onChange={(e) => setNombreCliente(e.target.value)}
          placeholder="Nombre completo"
          className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </label>

      <label className="block text-sm text-slate-400">
        Teléfono (WhatsApp)
        <input
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="300 123 4567"
          className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-sm text-slate-400 mb-1">Tipo de puesto</p>
          <div className="flex rounded-lg bg-slate-800/60 p-1">
            {['cubierta', 'normal'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSeccion(s)}
                className={`flex-1 rounded-md py-2 text-xs font-medium capitalize transition-colors ${
                  seccion === s ? 'bg-yellow-500/20 text-yellow-400' : 'text-slate-500'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-slate-400 mb-1">Modalidad</p>
          <div className="flex rounded-lg bg-slate-800/60 p-1">
            {[
              { key: 'mensual', label: 'Mensual' },
              { key: 'eventual', label: 'Eventual' },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTipoContrato(t.key)}
                className={`flex-1 rounded-md py-2 text-xs font-medium transition-colors ${
                  tipoContrato === t.key ? 'bg-yellow-500/20 text-yellow-400' : 'text-slate-500'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <label className="block text-sm text-slate-400">
        Tarifa cotizada (COP)
        <input
          type="number"
          inputMode="numeric"
          value={tarifa}
          onChange={(e) => setTarifa(e.target.value)}
          placeholder="150000"
          className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block text-sm text-slate-400">
          Vigente desde
          <input
            type="date"
            value={vigenciaDesde}
            onChange={(e) => setVigenciaDesde(e.target.value)}
            className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </label>
        <label className="block text-sm text-slate-400">
          Vigente hasta (opcional)
          <input
            type="date"
            value={vigenciaHasta}
            onChange={(e) => setVigenciaHasta(e.target.value)}
            className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </label>
      </div>

      <label className="block text-sm text-slate-400">
        Notas (opcional)
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          placeholder="Incluye vigilancia 24h, cámaras, techo..."
          className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </label>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleDescargar}
          disabled={!cotizacionValida}
          className="flex-1 rounded-lg border border-slate-700 text-slate-200 font-medium py-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Descargar PDF
        </button>
        <button
          onClick={handleEnviarWhatsApp}
          disabled={!cotizacionValida}
          className="flex-1 rounded-lg bg-yellow-500/90 hover:bg-yellow-500 text-slate-900 font-medium py-3 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Enviar por WhatsApp
        </button>
      </div>

      {aviso && <p className="text-[11px] text-slate-500 text-center">{aviso}</p>}
    </section>
  );
}
