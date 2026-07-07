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

// parking_puestos   (50 slots, se inicializan automáticamente)
[{
  "id": 1,
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
- **50 puestos**: se generan una sola vez con `crearPuestosIniciales()` y luego viven en
  `localStorage['parking_puestos']`.

## Próximos pasos sugeridos

- Migrar `ParkingProvider` a Supabase/Firebase reemplazando `useLocalStorage` por hooks que
  lean/escriban en la base — la interfaz pública (`puestos`, `registrarIngreso`, etc.) no
  tiene que cambiar.
- Agregar un módulo de "Clientes" para editar/renovar `fechaFin` de contratos mensuales.
- Agregar reportes por rango de fechas reutilizando `movimientos` (no solo el filtro de hoy).
