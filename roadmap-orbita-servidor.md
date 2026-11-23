# Roadmap · Órbita con servidor, base de datos, login con Google y chatbot

> De una app estática que vive en el navegador a una app con cuenta, datos en un servidor propio y un asistente con IA, **sin perder lo que la hace especial**: funciona offline, es rápida y respeta la privacidad.

Fecha de este documento: 22/11/2026. Todo lo que dependa de precios, límites o nombres de modelos de terceros está marcado con **(verificar)**: cambia seguido y hay que mirarlo el día que se implemente.

---

## 1. Punto de partida

Hoy Órbita es HTML, CSS y JavaScript vanilla, publicada en GitHub Pages.

| Área | Estado actual |
|---|---|
| Datos | `localStorage`: agenda en `orbita.v5` (con las notas dentro) y ubicación en `orbita.geo` |
| Cuentas | No hay. Cada navegador es una isla |
| Respaldo | Exportar/importar JSON a mano desde Balance |
| Código | `app.js` (~54 KB, un solo archivo), `cosmos.js` (astronomía), `oraculo.js`, `pdf.js` |
| IA | No hay |
| Lo que ya funciona | Cielo animado, Bitácora, Semana, Planetas, Balance, PDF, Cosmos, Oráculo, Notas, íconos en pestañas |

**Problemas que el servidor viene a resolver**
1. Borrar los datos del navegador o cambiar de celular pierde todo.
2. No se puede usar la misma agenda en el celular y en la compu.
3. No hay dónde guardar de forma segura una clave de IA.
4. Las notas ya son contenido valioso y no tienen respaldo automático.

---

## 2. Principios (no negociables)

1. **Local primero.** La app debe seguir funcionando sin conexión y sin cuenta. El servidor suma, no obliga.
2. **Tus datos son tuyos.** Exportar todo y borrar la cuenta tienen que ser botones que funcionen, no promesas.
3. **La IA es opcional y está apagada por defecto.** Nada de las notas sale hacia un proveedor de IA sin un permiso explícito y una elección de qué se envía.
4. **Simple de operar.** Un servidorcito, una base de datos, un comando para desplegar. Si necesita un equipo para mantenerse, está mal.
5. **Sin librerías pesadas sin motivo.** Se mantiene el estilo vanilla en el frontend.

---

## 3. Arquitectura propuesta

```
Navegador (PWA)                         Servidor (un solo proceso)
┌──────────────────────┐   HTTPS       ┌────────────────────────────┐
│ Órbita (HTML/JS)     │ ────────────▶ │ API REST  /api/*           │
│ Copia local (IndexedDB│              │ Auth Google  /auth/*       │
│  o localStorage)     │ ◀──────────── │ Proxy de IA  /api/chat     │
│ Cola de cambios      │   sync        │ Archivos estáticos (la app)│
└──────────────────────┘               └─────────────┬──────────────┘
                                                     │
                                          Base de datos (SQLite al inicio)
                                          + backups automáticos
```

### Decisiones de arquitectura

| Tema | Recomendación | Alternativa | Por qué |
|---|---|---|---|
| Lenguaje del servidor | **Node.js** | Python (FastAPI) | Mismo lenguaje que el frontend y que el validador `clean()` que ya existe |
| Framework | **Fastify** o **Hono** | Express | Livianos, buena validación por esquema |
| Base de datos | **SQLite** (con modo WAL) | PostgreSQL | Un archivo, cero administración, sobra para uno o pocos usuarios. Se migra a Postgres si crece |
| Búsqueda en notas | **FTS5** de SQLite | `LIKE` | Búsqueda de texto completo sin infraestructura extra |
| Dónde corre | **Un servidor propio** (un VPS o el Ubuntu que ya tenés) con **Caddy** adelante para HTTPS automático | Un PaaS administrado | Control total y costo fijo. Un PaaS es más cómodo pero suma dependencia **(verificar planes gratuitos y límites)** |
| Dominio | Frontend y API en **el mismo origen** (por ejemplo `orbita.nmft.ar`) | Frontend en GitHub Pages + API aparte | El mismo origen evita CORS y problemas de cookies de terceros con el login |
| Frontend | Seguir **vanilla**, servido por el mismo servidor | Framework | No hay motivo para sumar peso |
| Contenedores | **Docker Compose** (app + Caddy) | Instalar a mano | Despliegue repetible con un comando |

> **Consecuencia importante:** al servir la app desde el servidor, la versión de GitHub Pages queda como **demo en modo local** (sin cuenta, sin IA). Está bien: sirve de vidriera.

---

## 4. Fases

Estimaciones de esfuerzo en tamaños relativos: **S** (pocos días), **M** (una o dos semanas), **L** (varias semanas). Dependen de cuánto tiempo dediques por semana.

### Fase 0 · Cimientos (sin servidor todavía) — esfuerzo M

Preparar el terreno para no construir sobre arena.

- [ ] **Partir `app.js` en módulos ES** (`data.js`, `agenda.js`, `sky.js`, `cosmos-ui.js`, `notes.js`, `oracle-ui.js`, `ui.js`). Hoy es un archivo de 54 KB y crecer así se vuelve frágil.
- [ ] **Extraer el modelo de datos** (`clean`, `migrate`, `seed`, `place`, `proj`) a un módulo **sin dependencias del navegador**, para que el servidor lo reutilice tal cual.
- [ ] **Tests automáticos** del modelo: `clean`/`migrate`, `place` (recorte de bloques), proyección de semana regular, cruce de medianoche, eventos que se repiten y el oráculo (rangos de hora planetaria, retrogradaciones).
- [ ] **Esquema versionado** con migraciones explícitas (hoy `v: 6`).
- [ ] **PWA**: `manifest.json` y *service worker* para instalar la app y que abra offline.
- [ ] **Aviso de respaldo** cada tantos días mientras no haya cuenta.
- [ ] **Definir el contrato de la API** (sección 7) antes de escribir el servidor.

**Listo cuando:** la app se comporta idéntica que hoy, pasa los tests y se puede instalar como PWA.

---

### Fase 1 · Servidor mínimo y base de datos — esfuerzo M

- [ ] Repositorio con `/web` (la app) y `/server`.
- [ ] Servidor que sirve los estáticos y expone `/api/health`.
- [ ] Base SQLite con migraciones (sección 8).
- [ ] Endpoints de lectura y escritura para agenda y notas (aún sin login: un usuario único protegido por una clave de entorno, solo para desarrollo).
- [ ] Validación con esquemas en cada entrada (reutilizando las reglas de `clean()`).
- [ ] `Dockerfile` y `docker-compose.yml` con Caddy y HTTPS.
- [ ] **Backup automático** de la base, con prueba real de restauración.
- [ ] Logs estructurados **sin contenido de notas**.

**Listo cuando:** podés levantar todo con un comando, escribir y leer notas por la API y restaurar un backup en otra máquina.

---

### Fase 2 · Login con Google — esfuerzo M

Se usa **Google Identity Services** (OpenID Connect). Nunca se guardan contraseñas.

**Configuración en Google Cloud**
- [ ] Crear el proyecto y la **pantalla de consentimiento OAuth**.
- [ ] Crear un **ID de cliente web** y registrar los orígenes autorizados (el dominio de producción y `localhost` para desarrollo).
- [ ] Pedir solo los permisos básicos de identidad (`openid`, email, perfil). Cuantos menos permisos, menos fricción con la verificación de Google **(verificar requisitos vigentes para publicar la app y salir del modo de pruebas)**.

**En el servidor**
- [ ] Endpoint `POST /auth/google` que recibe el *ID token* y lo **verifica en el servidor**: firma contra las claves públicas de Google, `aud` igual a tu ID de cliente, `iss` correcto, `exp` vigente y `email_verified`. La librería oficial `google-auth-library` hace esto.
- [ ] **Identificar al usuario por el campo `sub`** de Google, no por el email (el email puede cambiar).
- [ ] Crear o actualizar el usuario y abrir una **sesión con cookie** `HttpOnly`, `Secure`, `SameSite=Lax` (o `Strict`), con vencimiento y rotación. Guardar solo el *hash* del identificador de sesión.
- [ ] Protección **CSRF** para las peticiones que modifican datos.
- [ ] `POST /auth/logout`, `GET /api/me`, y **`DELETE /api/me`** (borra cuenta y todos sus datos).
- [ ] Límite de intentos y de sesiones activas por usuario.

**En el frontend**
- [ ] Botón "Ingresar con Google" opcional. Sin cuenta, la app sigue funcionando en modo local.
- [ ] Pantalla corta que explica qué se guarda en el servidor y qué no.

**Listo cuando:** podés entrar con Google, ver tu nombre, cerrar sesión y borrar la cuenta; un usuario nunca puede leer datos de otro (hay un test que lo prueba).

---

### Fase 3 · Sincronización local-primero — esfuerzo L

Es la fase más delicada. Conviene hacerla despacio.

- [ ] **Identificadores generados en el cliente** (UUID) para toda fila nueva, así se puede crear offline.
- [ ] Cada registro lleva `updated_at` y `deleted_at` (**borrado lógico** o *tombstone*, para que un borrado también se sincronice).
- [ ] **Cola de cambios** en el cliente: guarda lo que falta enviar y reintenta al volver la conexión.
- [ ] Endpoint de sincronización incremental: `GET /api/sync?since=<marca>` y `POST /api/sync` con los cambios.
- [ ] **Resolución de conflictos:** *el último en escribir gana, por registro* (simple y suficiente para uso personal). Las notas son casi siempre altas, así que el riesgo es bajo.
- [ ] **Primera importación:** al ingresar por primera vez, ofrecer subir lo que ya existe en `localStorage` (se valida con `clean()` y se muestra un resumen antes de confirmar).
- [ ] Indicador de estado discreto: "sincronizado / pendiente / sin conexión".
- [ ] Probar los casos feos: dos dispositivos editando el mismo día, cortar la conexión a mitad, reloj del celular atrasado.

**Decisiones abiertas de esta fase**
- La función `freeze()` (que registra cada día que pasa) hoy corre en el cliente. ¿Sigue ahí o pasa a un trabajo del servidor? Recomendación: **sigue en el cliente** y se sincroniza como cualquier cambio, pero hay que evitar que dos dispositivos congelen un mismo día de forma distinta.
- **Zona horaria:** guardar los instantes en UTC y la zona del usuario (nombre IANA) en sus ajustes, porque el agrupado por día es local.

**Listo cuando:** editás en el celular, abrís la compu y ves lo mismo; sin conexión todo sigue andando y al volver se sincroniza sin duplicar ni perder nada.

---

### Fase 4 · Chatbot con IA — esfuerzo M

Con servidor, la clave del proveedor **vive en el servidor** y nunca llega al navegador.

**Servidor**
- [ ] `POST /api/chat` como **proxy** hacia el proveedor, con respuesta en *streaming* (SSE).
- [ ] **Proveedor configurable** por variables de entorno: Google (Gemini) y cualquier proveedor compatible con el formato de OpenAI (por ejemplo Groq u otro). No fijar nombres de modelos en el código **(verificar modelos y planes vigentes)**.
- [ ] **Límites por usuario** (pedidos y tokens por día), contador en la tabla `usage` y mensajes claros al llegar al tope (`429`).
- [ ] Control del **tamaño del contexto**: nunca mandar todo el diario; solo el período o las notas elegidas.
- [ ] **No registrar el contenido** de los mensajes en los logs.
- [ ] Tiempo máximo de espera y mensajes de error entendibles (clave inválida, límite alcanzado, proveedor caído).

**Privacidad y seguridad**
- [ ] Interruptor **"Usar asistente de IA"** apagado por defecto, con un aviso que diga exactamente qué se envía y a quién.
- [ ] Antes de cada consulta se ve qué notas van a viajar (por ejemplo "las 12 notas de esta semana") y se puede quitar alguna.
- [ ] **Las notas son datos, no instrucciones**: en el *prompt* se marcan como contenido citado para reducir el riesgo de inyección de instrucciones escondidas en un texto.
- [ ] Tener presente que **el plan gratuito de algunos proveedores usa el contenido para mejorar sus productos** (Google lo indica en su página de precios, consultada el 22/11/2026, y el plan pago no) **(verificar)**. Para un diario conviene decidir si se acepta eso o se usa un plan donde no ocurra.

**Frontend (dentro de Notas)**
- [ ] Panel "Conversar" con historial de la sesión (en memoria; guardarlo es opcional y también opt-in).
- [ ] Atajos útiles: *resumir mi semana*, *buscar patrones*, *ayudarme a ordenar esta idea*, *interpretar el Oráculo de hoy*.
- [ ] Botón **"Guardar como nota"** en cada respuesta.
- [ ] Mostrar siempre cuándo y qué se envió.

**Más adelante (opcional):** que el asistente consulte la base con herramientas (buscar notas por fecha o texto, leer el balance de la semana) en lugar de recibir texto pegado.

**Listo cuando:** con la IA activada podés pedir "resumí mi semana", ver qué notas se mandan, recibir la respuesta en vivo y guardarla; con la IA apagada no sale ni un byte hacia el proveedor.

---

### Fase 5 · Producción y operación — esfuerzo M

- [ ] HTTPS forzado, **HSTS** y cabeceras de seguridad (CSP, `X-Content-Type-Options`, etc.).
- [ ] **CORS cerrado** (mismo origen) y límite de tamaño de las peticiones.
- [ ] **Rate limiting** general y más estricto en login y chat.
- [ ] **Backups** diarios con retención y restauración probada cada tanto.
- [ ] Monitoreo mínimo: *uptime*, errores, espacio en disco.
- [ ] **CI/CD**: GitHub Actions que corra los tests y despliegue.
- [ ] Entorno de prueba (*staging*) separado.
- [ ] **Política de privacidad** y términos en lenguaje simple.
- [ ] **Exportar todo** (JSON y `.txt`) y **borrar cuenta** funcionando de punta a punta.
- [ ] Plan para actualizar dependencias y revisar vulnerabilidades.

---

### Fase 6 · Horizonte (cuando lo anterior esté sólido)

Ideas con más valor que sumar más texto de oráculo:

1. **Revisión por ciclo lunar:** en cada luna nueva o llena, la app junta lo planificado contra lo vivido, las notas del ciclo y una pregunta para escribir.
2. **Patrones propios:** con meses de uso, mostrar relaciones reales entre tus notas, tus horas por planeta y el momento lunar. Son datos tuyos, no horóscopo.
3. **Etiquetas en las notas** y vínculo nota ↔ planeta (actividad).
4. **Agrupar pestañas** en el celular si siguen creciendo (por ejemplo Semana y Planetas bajo "Configurar").
5. **Notificaciones** (recordatorio de revisión, aviso del bloque que empieza), con permiso explícito.
6. **APK** (WebView) o PWA instalada como alternativa a tiendas.
7. **Compartir** el cronograma semanal en PDF con un enlace.

---

## 5. Orden recomendado

```
Fase 0 ──▶ Fase 1 ──▶ Fase 2 ──▶ Fase 3 ──▶ Fase 4 ──▶ Fase 5
cimientos   servidor    Google     sync       chatbot    producción
```

- **Fase 0 primero, siempre:** sin módulos ni tests, cada fase siguiente cuesta el doble.
- La **Fase 4 (chatbot)** puede adelantarse a la 3 si querés ver resultados rápido, porque solo necesita servidor y login. Pero sin sincronización el asistente solo verá lo que haya en el servidor, así que conviene al menos subir las notas.
- La **Fase 5** no es el final: partes (backups, HTTPS) se hacen desde la Fase 1.

---

## 6. Seguridad y privacidad: lista de control

- [ ] Ninguna clave ni secreto en el repositorio (variables de entorno, `.env` fuera de git).
- [ ] Toda consulta a la base filtra por `user_id` del usuario de la sesión, nunca por un dato que mande el cliente.
- [ ] Verificación del ID token de Google **siempre en el servidor**.
- [ ] Cookies `HttpOnly` + `Secure` + `SameSite`.
- [ ] Escapado de todo texto de usuario al mostrarlo (ya se hace con `esc()`; mantenerlo en cada vista nueva).
- [ ] El contenido de notas y chats **no aparece en logs**.
- [ ] La IA no recibe nada sin consentimiento y sin que se vea qué se envía.
- [ ] Backups cifrados y con acceso restringido.
- [ ] Exportación y borrado de cuenta probados.
- [ ] Revisión periódica de dependencias.

---

## 7. API (borrador)

```
Autenticación
  POST   /auth/google          recibe ID token, abre sesión
  POST   /auth/logout
  GET    /api/me               datos del usuario y ajustes
  DELETE /api/me               borra cuenta y datos

Agenda
  GET    /api/state            estado completo (para la primera carga)
  GET    /api/sync?since=...   cambios desde una marca
  POST   /api/sync             subir cambios en lote
  POST   /api/import           importar el JSON de respaldo actual
  GET    /api/export           exportar todo

Notas
  GET    /api/notes?from=&to=&q=&limit=&cursor=
  POST   /api/notes
  PATCH  /api/notes/:id
  DELETE /api/notes/:id

Asistente
  POST   /api/chat             streaming (SSE); body: { messages, noteIds? }
  GET    /api/usage            consumo del día

Sistema
  GET    /api/health
```

---

## 8. Modelo de datos (borrador SQL)

Se normalizan las notas y las actividades; los bloques de cada día se guardan como JSON por fecha, porque siempre se leen y escriben juntos.

```sql
CREATE TABLE users (
  id            TEXT PRIMARY KEY,          -- UUID
  google_sub    TEXT NOT NULL UNIQUE,      -- identificador estable de Google
  email         TEXT,
  name          TEXT,
  picture       TEXT,
  tz            TEXT NOT NULL DEFAULT 'America/Argentina/Cordoba',
  ai_enabled    INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL,
  last_login_at INTEGER
);

CREATE TABLE sessions (
  id_hash    TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  user_agent TEXT
);

CREATE TABLE activities (          -- "planetas"
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, color TEXT NOT NULL, center INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL, deleted_at INTEGER
);

CREATE TABLE tpl_blocks (          -- semana regular
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dow INTEGER NOT NULL, start_min INTEGER NOT NULL, end_min INTEGER NOT NULL,
  activity_id TEXT NOT NULL, title TEXT,
  updated_at INTEGER NOT NULL, deleted_at INTEGER
);

CREATE TABLE day_overrides (       -- días personalizados o ya registrados
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,              -- AAAA-MM-DD
  blocks_json TEXT NOT NULL, fixed INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, date)
);

CREATE TABLE recurring (           -- eventos que se repiten
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('m','y')), month INTEGER, day INTEGER NOT NULL,
  start_min INTEGER NOT NULL, end_min INTEGER NOT NULL,
  activity_id TEXT NOT NULL, title TEXT,
  updated_at INTEGER NOT NULL, deleted_at INTEGER
);

CREATE TABLE settings (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  start_date TEXT, frozen_date TEXT,
  geo_lat REAL, geo_lon REAL, geo_name TEXT,
  updated_at INTEGER NOT NULL
);

CREATE TABLE notes (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ts INTEGER NOT NULL,             -- instante de la nota (ms, UTC)
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, deleted_at INTEGER
);
CREATE INDEX notes_user_ts ON notes (user_id, ts DESC);
-- búsqueda de texto completo (FTS5) sincronizada con notes

CREATE TABLE usage (               -- consumo de IA por día
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day TEXT NOT NULL, requests INTEGER NOT NULL DEFAULT 0,
  tokens_in INTEGER NOT NULL DEFAULT 0, tokens_out INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);
```

---

## 9. Variables de entorno (borrador)

```
PORT=3000
DATABASE_PATH=/data/orbita.db
SESSION_SECRET=...                 # larga y aleatoria
PUBLIC_URL=https://orbita.nmft.ar
GOOGLE_CLIENT_ID=...               # ID de cliente web
AI_PROVIDER=google|openai-compatible
AI_BASE_URL=...                    # solo para compatibles con OpenAI
AI_API_KEY=...
AI_MODEL=...                       # no fijar en el código (verificar vigentes)
AI_DAILY_REQUESTS=30
AI_DAILY_TOKENS=...
```

## 10. Estructura de carpetas (borrador)

```
orbita/
├── web/                  # la app (vanilla, módulos ES, PWA)
│   ├── index.html
│   ├── css/
│   └── js/ (data, agenda, sky, cosmos, oraculo, notes, sync, chat, ui)
├── server/
│   ├── src/ (app, auth, routes, db, sync, chat, usage)
│   ├── migrations/
│   └── test/
├── shared/               # modelo de datos reutilizado en cliente y servidor
├── docker-compose.yml
├── Caddyfile
└── .github/workflows/
```

---

## 11. Riesgos y cómo se manejan

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Conflictos de sincronización que pierden datos | Alto | Borrado lógico, último-en-escribir-gana por registro, tests de casos feos y copia de seguridad antes de la primera importación |
| Fuga de notas hacia un tercero (IA) | Alto | Apagado por defecto, selección visible, sin logs de contenido, proveedor sin uso de datos para entrenar si es posible |
| Límites o precios de la IA gratuita cambian | Medio | Proveedor configurable, límites por usuario y mensajes claros; no depender de un número |
| Pérdida de la base | Alto | Backups automáticos y restauración probada |
| Costo de mantener el servidor | Medio | Empezar con SQLite y un solo proceso; automatizar el despliegue |
| La app se vuelve más pesada y pierde su gracia | Medio | Mantener el modo local y los principios de la sección 2 |
| Cambios en Google Identity Services o en su verificación | Bajo/medio | Seguir la documentación vigente **(verificar)** y aislar el login en un solo módulo |

---

## 12. Decisiones que hay que tomar antes de empezar

1. **¿Dónde se aloja?** Servidor propio o un servicio administrado. Recomendación: servidor propio con Docker y Caddy.
2. **¿Para cuántas personas?** Solo para vos (SQLite alcanza de sobra) o abierta a otros (suma moderación de uso, política de privacidad más formal y la verificación de la app en Google).
3. **¿Qué proveedor de IA y en qué plan?** Define si el contenido se usa o no para entrenar. Para un diario personal pesa mucho.
4. **¿Quién congela los días?** (ver Fase 3).
5. **¿Se guarda el historial del chat?** Recomendación: no por defecto.
6. **Nombre y dominio** definitivos.

---

*Este roadmap es una guía, no un contrato: conviene revisarlo al terminar cada fase.*
