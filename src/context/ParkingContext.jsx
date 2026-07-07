// src/context/ParkingContext.jsx
import React, { createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { getTodayISO } from '../utils/dateUtils';
import { calcularEstadoSemaforo } from '../hooks/useParkingStatus';
import { getCodigoPuesto } from '../utils/puestoUtils';

const TOTAL_CUBIERTA = 30;
const TOTAL_NORMAL = 20;
const TOTAL_PUESTOS = TOTAL_CUBIERTA + TOTAL_NORMAL;

function crearPuestosIniciales() {
  const base = (seccion, cantidad, offsetId) =>
    Array.from({ length: cantidad }, (_, i) => ({
      id: offsetId + i + 1, // id único global, se usa como key y para localStorage
      numero: i + 1, // número dentro de la sección (para el código C-01, N-01, ...)
      seccion, // 'cubierta' | 'normal'
      ocupado: false,
      clienteId: null,
      placa: null,
      tipo: null, // 'mensual' | 'eventual'
      fechaFin: null, // solo aplica a clientes mensuales, alimenta el semáforo
      horaEntrada: null,
    }));

  return [
    ...base('cubierta', TOTAL_CUBIERTA, 0),
    ...base('normal', TOTAL_NORMAL, TOTAL_CUBIERTA),
  ];
}

const ParkingContext = createContext(null);

export function ParkingProvider({ children }) {
  const [settings, setSettings] = useLocalStorage('parking_settings', {
    nombreEmpresa: 'Mi Parqueadero',
    nit: '',
  });

  const [clientes, setClientes] = useLocalStorage('parking_clientes', []);
  const [puestos, setPuestos] = useLocalStorage('parking_puestos', crearPuestosIniciales());
  const [movimientos, setMovimientos] = useLocalStorage('parking_movimientos', []);
  const [eventos, setEventos] = useLocalStorage('parking_eventos', []);

  // Migración: si en localStorage quedaron puestos del esquema anterior
  // (sin campo "seccion"), los reclasificamos: los primeros 30 -> cubierta,
  // los siguientes 20 -> normal, conservando ocupación/placa/contrato.
  useEffect(() => {
    if (puestos.length && puestos[0].seccion === undefined) {
      setPuestos((prev) => {
        if (prev.length !== TOTAL_PUESTOS) return crearPuestosIniciales();
        return prev.map((p, idx) => {
          const seccion = idx < TOTAL_CUBIERTA ? 'cubierta' : 'normal';
          const numero = idx < TOTAL_CUBIERTA ? idx + 1 : idx - TOTAL_CUBIERTA + 1;
          return { ...p, seccion, numero };
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Acciones ----

  const registrarIngreso = useCallback(
    ({ puestoId, placa, tipo, clienteId, nombreCliente, telefono, fechaFin, monto }) => {
      const ahora = new Date();
      const puestoRef = puestos.find((p) => p.id === puestoId);
      let clienteIdFinal = clienteId || null;

      // Si es cliente mensual nuevo (sin clienteId existente), lo creamos en el maestro
      if (tipo === 'mensual' && !clienteIdFinal) {
        const nuevoCliente = {
          id: Date.now(),
          nombre: nombreCliente || placa,
          telefono: telefono || '',
          fechaFin,
          tipo: 'mensual',
        };
        setClientes((prev) => [...prev, nuevoCliente]);
        clienteIdFinal = nuevoCliente.id;
      } else if (tipo === 'mensual' && clienteIdFinal && telefono) {
        // Cliente existente: si se capturó/editó el teléfono, lo actualizamos
        setClientes((prev) =>
          prev.map((c) => (c.id === clienteIdFinal ? { ...c, telefono } : c))
        );
      }

      setPuestos((prev) =>
        prev.map((p) =>
          p.id === puestoId
            ? {
                ...p,
                ocupado: true,
                placa: placa.toUpperCase(),
                tipo,
                clienteId: clienteIdFinal,
                fechaFin: tipo === 'mensual' ? fechaFin : null,
                horaEntrada: ahora.toISOString(),
              }
            : p
        )
      );

      setEventos((prev) => [
        ...prev,
        {
          id: Date.now(),
          puestoId,
          seccion: puestoRef?.seccion || null,
          tipo: 'ingreso',
          fecha: getTodayISO(),
          hora: ahora.toISOString(),
        },
      ]);

      if (monto && monto > 0) {
        setMovimientos((prev) => [
          ...prev,
          {
            id: Date.now(),
            placa: placa.toUpperCase(),
            puestoId,
            fecha: getTodayISO(),
            hora: ahora.toISOString(),
            monto: Number(monto),
          },
        ]);
      }
    },
    [puestos, setPuestos, setMovimientos, setClientes, setEventos]
  );

  const liberarPuesto = useCallback(
    (puestoId, montoCobro) => {
      const puesto = puestos.find((p) => p.id === puestoId);

      if (montoCobro && montoCobro > 0 && puesto) {
        setMovimientos((prev) => [
          ...prev,
          {
            id: Date.now(),
            placa: puesto.placa,
            puestoId,
            fecha: getTodayISO(),
            hora: new Date().toISOString(),
            monto: Number(montoCobro),
          },
        ]);
      }

      setEventos((prev) => [
        ...prev,
        {
          id: Date.now(),
          puestoId,
          seccion: puesto?.seccion || null,
          tipo: 'salida',
          fecha: getTodayISO(),
          hora: new Date().toISOString(),
        },
      ]);

      setPuestos((prev) =>
        prev.map((p) =>
          p.id === puestoId
            ? {
                ...p,
                ocupado: false,
                clienteId: null,
                placa: null,
                tipo: null,
                fechaFin: null,
                horaEntrada: null,
              }
            : p
        )
      );
    },
    [puestos, setPuestos, setMovimientos, setEventos]
  );

  const actualizarCliente = useCallback(
    (clienteId, cambios) => {
      setClientes((prev) => prev.map((c) => (c.id === clienteId ? { ...c, ...cambios } : c)));
    },
    [setClientes]
  );

  // ---- Datos derivados (nunca persistidos, se recalculan en cada render) ----

  const movimientosHoy = useMemo(() => {
    const hoy = getTodayISO();
    return movimientos
      .filter((m) => m.fecha === hoy)
      .sort((a, b) => new Date(b.hora) - new Date(a.hora));
  }, [movimientos]);

  const totalVentasHoy = useMemo(
    () => movimientosHoy.reduce((sum, m) => sum + Number(m.monto || 0), 0),
    [movimientosHoy]
  );

  const puestosOcupados = useMemo(() => puestos.filter((p) => p.ocupado).length, [puestos]);
  const puestosLibres = TOTAL_PUESTOS - puestosOcupados;

  const resumenPorSeccion = useMemo(() => {
    const cubierta = puestos.filter((p) => p.seccion === 'cubierta');
    const normal = puestos.filter((p) => p.seccion === 'normal');
    return {
      cubierta: {
        total: cubierta.length,
        ocupados: cubierta.filter((p) => p.ocupado).length,
        libres: cubierta.filter((p) => !p.ocupado).length,
      },
      normal: {
        total: normal.length,
        ocupados: normal.filter((p) => p.ocupado).length,
        libres: normal.filter((p) => !p.ocupado).length,
      },
    };
  }, [puestos]);

  // Puestos mensuales en 'retrasado' o 'en-mora', con los datos del cliente
  // ya resueltos (nombre, teléfono) para armar recordatorios de WhatsApp.
  const clientesEnAlerta = useMemo(() => {
    return puestos
      .filter((p) => p.ocupado && p.tipo === 'mensual' && p.fechaFin)
      .map((p) => {
        const estado = calcularEstadoSemaforo(p.fechaFin);
        const cliente = clientes.find((c) => c.id === p.clienteId) || null;
        return {
          puestoId: p.id,
          codigo: getCodigoPuesto(p),
          placa: p.placa,
          fechaFin: p.fechaFin,
          estado,
          clienteId: cliente?.id || null,
          nombre: cliente?.nombre || p.placa,
          telefono: cliente?.telefono || '',
        };
      })
      .filter((item) => item.estado.status === 'en-mora' || item.estado.status === 'retrasado')
      .sort((a, b) => a.estado.diasRestantes - b.estado.diasRestantes);
  }, [puestos, clientes]);

  const value = {
    settings,
    setSettings,
    clientes,
    actualizarCliente,
    puestos,
    movimientos,
    eventos,
    movimientosHoy,
    totalVentasHoy,
    puestosOcupados,
    puestosLibres,
    resumenPorSeccion,
    clientesEnAlerta,
    totalPuestos: TOTAL_PUESTOS,
    registrarIngreso,
    liberarPuesto,
  };

  return <ParkingContext.Provider value={value}>{children}</ParkingContext.Provider>;
}

export function useParking() {
  const ctx = useContext(ParkingContext);
  if (!ctx) {
    throw new Error('useParking debe usarse dentro de un <ParkingProvider>');
  }
  return ctx;
}
