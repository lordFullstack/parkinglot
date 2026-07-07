# Núcleo funcional — PWA Parqueadero

## Estructura de archivos

```
src/
├── App.jsx                        # Provider + navegación (Resumen / Puestos)
├── index.css                      # Tailwind + keyframe del drawer
├── context/
│   └── ParkingContext.jsx         # Fuente única de verdad (puestos, clientes, movimientos, settings)
├── hooks/
│   ├── useParkingStatus.js        # Semáforo derivado a partir de fechaFin
│   └── useLocalStorage.js         # Helper genérico de persistencia
├── components/
│   ├── Dashboard.jsx              # Header + tarjetas resumen + movimientos de hoy
│   ├── ParkingGrid.jsx            # Grid de 50 puestos
│   ├── VehicleDrawer.jsx          # Panel inferior para registrar/liberar
│   └── SemaforoBadge.jsx          # Píldora de estado reutilizable
└── utils/
    └── dateUtils.js               # getTodayISO, diffInDays, formatCOP, formatHora
```

## Cómo integrarlo

1. Copia la carpeta `src/` sobre tu proyecto Vite (o los archivos individuales si ya tienes `App.jsx`).
2. Asegúrate de tener Tailwind configurado (igual que en ContaFacil).
3. Importa `index.css` en tu `main.jsx`.
4. Listo — `App.jsx` ya envuelve todo con `ParkingProvider`.

Este zip ya viene como proyecto Vite completo (`package.json`, `vite.config.js`,
`index.html`, `tailwind.config.js`, `postcss.config.js`, `src/main.jsx`), listo para subir
directo a un repo nuevo.

## Despliegue a GitHub Pages (sin build local)

1. Crea un repo nuevo en GitHub, por ejemplo `parqueadero` (público).
2. Sube todo el contenido de este zip a la raíz del repo (arrástralo en github.dev o en la
   web de GitHub, "Add file → Upload files").
3. Si tu repo **no** se llama `parqueadero`, edita `vite.config.js` y cambia
   `base: '/parqueadero/'` por `base: '/<nombre-de-tu-repo>/'`.
4. En el repo: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
5. Con eso, cada `push` a `main` dispara `.github/workflows/deploy.yml`, que instala
   dependencias, corre `npm run build` y publica `dist/` en GitHub Pages automáticamente —
   no necesitas compilar nada desde tu celular.
6. Después del primer push, revisa la pestaña **Actions** del repo: cuando el workflow
   termine en verde, tu app quedará en `https://<tu-usuario>.github.io/parqueadero/`.

## Esquema de datos en localStorage

```js
// parking_settings
{ "nombreEmpresa": "Parqueadero Central", "nit": "123456789" }

// parking_clientes  (maestro de contratos mensuales)
[{ "id": 1, "nombre": "Juan Pérez", "fechaFin": "2026-07-10", "tipo": "mensual" }]

// parking_puestos   (30 cubierta + 20 normal, se inicializan automáticamente)
[{
  "id": 1,
  "seccion": "cubierta",   // 'cubierta' | 'normal'
  "numero": 1,             // número dentro de la sección -> código C-01, N-01, ...
  "ocupado": true,
  "clienteId": 1,
  "placa": "ABC-123",
  "tipo": "mensual",        // 'mensual' | 'eventual'
  "fechaFin": "2026-07-10", // null si es eventual/libre
  "horaEntrada": "2026-07-07T14:32:00.000Z"
}]

// parking_movimientos  (ingresos de dinero)
[{ "id": 1, "placa": "ABC-123", "puestoId": 5, "fecha": "2026-07-07", "hora": "...", "monto": 5000 }]
```

## Decisiones clave

- **Estado derivado**: el color del semáforo NUNCA se guarda. `useParkingStatus` lo calcula
  en cada render a partir de `fechaFin`, comparando contra `getTodayISO()`. Así el color
  cambia solo con el paso del tiempo, sin ningún job ni actualización manual.
  - `dias < 0` → `en-mora` (rojo)
  - `0 ≤ dias ≤ 3` → `retrasado` (amarillo)
  - `dias > 3` → `al-dia` (verde)
  - Puesto libre / cliente eventual sin contrato → `libre` (gris), o `al-dia` si pasas
    `treatNullAsAlDia`.
- **Context API**: `ParkingContext` expone `puestos`, `clientes`, `movimientos`,
  `movimientosHoy`, `totalVentasHoy`, `puestosOcupados/Libres` y las acciones
  `registrarIngreso` / `liberarPuesto`, evitando pasar props manualmente.
- **Filtrado por día**: `movimientosHoy` compara `m.fecha === getTodayISO()` (string a
  string), el método más confiable en JS para evitar líos de huso horario.
- **Ventas de hoy**: es la suma de `monto` de `movimientosHoy` — un vehículo puede generar
  un movimiento al entrar, al salir, o ambos; vos decidís cuándo cobrar desde el Drawer.
- **30 cubierta + 20 normal**: `crearPuestosIniciales()` genera dos bloques con un `id` global
  único (1-50 para localStorage) y un `numero` propio de cada sección, que es lo que se
  muestra como código (`C-01`...`C-30`, `N-01`...`N-20`). `resumenPorSeccion` en el Context
  da los conteos de ocupados/libres por sección para el Dashboard y el Grid.
  Si ya tenías datos guardados con el esquema anterior (50 puestos sin sección), el Provider
  los migra automáticamente al abrir la app: los primeros 30 pasan a "cubierta" y los últimos
  20 a "normal", conservando ocupación y contrato.

## Novedades: Ocupación, Cotizaciones PDF, WhatsApp y Recordatorios

- **`src/hooks/useOcupacionHistorial.js`** + **`src/components/OccupancyChart.jsx`**: gráfico
  con selector Diario/Semanal/Anual. Mide "vehículos ingresados" por periodo como proxy de
  ocupación (no se guarda un snapshot continuo de ocupación exacta para no inflar
  localStorage). La fuente es el nuevo log `parking_eventos`, que registra cada
  ingreso/salida — arranca vacío desde que actualices el código, no tiene datos retroactivos.
- **`src/utils/pdfUtils.js`** (`generarCotizacionPDF`): arma un PDF con `jsPDF` — logo (si
  subiste uno en Ajustes), nombre/NIT del parqueadero, datos del cliente, tarifa destacada y
  notas. Se descarga directo al dispositivo.
- **`src/utils/whatsappUtils.js`**: normaliza el teléfono a formato `57XXXXXXXXXX` y abre
  `wa.me` con un mensaje pre-escrito. **Importante**: WhatsApp no permite adjuntar archivos
  automáticamente desde un link — el flujo es descargar el PDF y luego adjuntarlo a mano en
  el chat que se abre (2 taps).
- **`src/components/QuoteGenerator.jsx`**: formulario de cotización para clientes nuevos
  (sección, modalidad, tarifa, vigencia, notas) → botones "Descargar PDF" y "Enviar por
  WhatsApp".
- **`src/components/ReminderPanel.jsx`**: lista clientes mensuales en `en-mora` o
  `retrasado` (usa `clientesEnAlerta` del Context) con botón directo a WhatsApp con mensaje
  pre-armado. Si al cliente le falta el teléfono, deja agregarlo ahí mismo.
- **`src/components/Settings.jsx`**: pantalla de Ajustes para nombre, NIT y logo (se guarda
  como base64 en `settings.logoBase64`, usado por el PDF).
- **`src/components/Herramientas.jsx`**: agrupa Ocupación/Cotizar/Recordatorios en una sola
  pestaña con sub-tabs, para no saturar la barra inferior.

**Esquema nuevo/actualizado en localStorage:**
```js
// parking_clientes ahora incluye teléfono
{ "id": 1, "nombre": "Juan Pérez", "telefono": "573001234567", "fechaFin": "2026-07-10", "tipo": "mensual" }

// parking_eventos (nuevo) — log de ingresos/salidas para el gráfico
{ "id": 1, "puestoId": 5, "seccion": "cubierta", "tipo": "ingreso", "fecha": "2026-07-07", "hora": "2026-07-07T14:32:00.000Z" }

// parking_settings ahora puede incluir logo
{ "nombreEmpresa": "Parqueadero Central", "nit": "123456789", "logoBase64": "data:image/png;base64,..." }
```

## Próximos pasos sugeridos

- Migrar `ParkingProvider` a Supabase/Firebase reemplazando `useLocalStorage` por hooks que
  lean/escriban en la base — la interfaz pública (`puestos`, `registrarIngreso`, etc.) no
  tiene que cambiar.
- Agregar un módulo de "Clientes" para editar/renovar `fechaFin` de contratos mensuales.
- Agregar reportes por rango de fechas reutilizando `movimientos` (no solo el filtro de hoy).
