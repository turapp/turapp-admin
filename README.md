# Turapp — App del conductor

`driver.turapp.co`. Next.js 16 (App Router, Turbopack, `output: 'standalone'`).
La base de datos, las políticas RLS y las Edge Functions viven en el repo
`turapp-supabase`; el panel de administración en `turapp-dashboard`.

Todas las rutas cuelgan de `/driver/*`. El middleware (`src/middleware.js`)
redirige lo demás: en `driver.turapp.co` no existe ninguna ruta fuera de ahí.

## Un conductor, varios servicios

La misma persona puede tener taxi, Viajes a Cali y encomiendas aprobados a la
vez, y cada uno se trabaja distinto. Por eso **la pantalla sigue al servicio
activo, no al vehículo**:

- `src/lib/servicios.js` es la fuente única: nombre, color, pieza 3D, promesa,
  requisitos y cómo se llama una unidad de trabajo (carrera / reserva /
  encomienda / envío). Si un texto de un servicio hay que cambiarlo, se cambia
  ahí y cambia en todas partes.
- `BarraConexion` conecta y desconecta, y deja elegir con qué servicio. Escribe
  `driver_profiles.status`, que es lo que mira `find_nearby_drivers()`.
- `OnboardingServicio` explica ese servicio la primera vez que se lo aprueban.
  Se marca en `driver_services.onboarding_visto_at`.
- `AvisoPendientes` dice qué hay esperando ahora: demanda cerca (`presion_demanda`),
  puestos vendidos de la próxima salida a Cali, o encomiendas sin dueño.
- `AsistenteIA` responde por voz, texto o foto sobre el estado real del
  conductor.

## Conectar un modelo de lenguaje al asistente

`AsistenteIA.js` responde hoy con una base de conocimiento propia, aterrizada
en los datos del conductor (si está aprobado, qué servicios tiene, si hay GPS,
cuánto se le debe). No inventa: si no sabe, lo dice.

Cuando haya API key, **el único punto a cambiar es `preguntarAlModelo()`**. Ya
recibe la pregunta y tiene el estado cargado en `estado`; basta con mandar los
dos al modelo y devolver `{ titulo, pasos: [] }`. La interfaz —el dictado, la
cámara, el hilo— no se toca.

## Desarrollo

```bash
npm run dev
```

Usuarios de prueba y contraseña: ver el README de `turapp-supabase`.

## Despliegue

Se despliega en EasyPanel desde `master`:

```bash
curl -X POST "https://iqwdxr.easypanel.host/api/trpc/services.app.deployService" -H "Authorization: Bearer $EASYPANEL_TOKEN" -H "Content-Type: application/json" -d '{"json":{"projectName":"drivers","serviceName":"turapp_driver"}}'
```

Devuelve `{}` cuando encola el build. **Un `200` en el dominio no prueba que se
desplegó**: el contenedor viejo sigue respondiendo mientras se construye el
nuevo. Para verificar, busca en la página algún texto que solo exista en el
commit nuevo.

Desplegar las tres apps en paralelo satura el servidor (4 núcleos) y devuelve
502. De a una.

## Detalles que cuesta caro olvidar

- **Un ancestro con `transform` rompe `position: fixed`.** El simulador de
  iPhone (`#driver-iphone-wrapper`) escala con `transform`, así que dentro de
  él `fixed` se ancla al marco y no a la ventana. Por eso todo lo flotante de
  la app usa `absolute`.
- **`driver_profiles.status` es lo que decide si le llegan viajes.** Cambiar
  solo el estado de React deja la pantalla diciendo "en línea" mientras el
  backend lo tiene apagado.
- **La posición se escribe en `driver_locations`**; un trigger la copia a
  `driver_profiles.current_location`. No escribir esa columna a mano.
