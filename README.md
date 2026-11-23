# ORBYTAN Agenda Solar · Sistema Solar del Tiempo

> Tu semana como sistema solar.

**Órbita** es una agenda semanal que convierte tu tiempo en un sistema solar animado. Cada actividad de tu vida es un **planeta**, y su tamaño depende de cuántas horas le dedicás. La actividad más importante va al **centro, como el sol**, y todo lo demás gira a su alrededor.

Planificás una semana tipo, la app la proyecta a cada fecha, y la **bitácora** registra lo que realmente pasó cada día. Todo funciona offline, sin cuentas y sin servidor: tus datos quedan en tu dispositivo.

🔗 **Demo:** https://nmftstudio.github.io/agendasolar/

---

## Cómo funciona

### Planetas
Cada planeta es una actividad o área de tu vida, con **nombre**, **color** y la opción **"Va en el centro (el sol)"**. Solo uno puede ser el sol. En la pestaña *Planetas* ves cuántas horas tiene cada uno en el período elegido.

### Semana regular
Tu **semana tipo**, de lunes a domingo, armada con bloques horarios. Es la base de todo: la bitácora la copia a cada fecha futura.

### Bitácora
Es la agenda de fechas concretas. Cada día puede estar en uno de estos estados:

- **Sigue la semana regular:** mientras no lo toques, refleja los cambios de la semana tipo.
- **Día personalizado (`•`):** si agregás o cambiás un bloque, el día deja de seguir la semana regular. Podés volver con *Volver a la semana regular*.
- **Registrado:** cuando pasa un día, queda guardado tal como estaba planificado. Si hiciste otra cosa, tocás el bloque y lo corregís; el día se marca como **corregido (`✎`)**.

Las fechas anteriores al inicio de uso de la bitácora no cuentan en el balance, pero podés cargarlas a mano.

### Bloques
Un bloque asigna un tramo horario a un planeta, con título opcional (hasta 40 caracteres).

- **Se hace lugar solo:** un bloque nuevo recorta o reemplaza lo que haya en ese horario.
- **Cruza la medianoche:** si "Hasta" es anterior a "Desde", el bloque continúa en el día siguiente.
- **Huecos:** los tramos libres de 15 minutos o más aparecen como "Sin asignar" y se completan con un toque.
- **Semana regular:** podés aplicar un bloque a varios días a la vez.
- **Bitácora:** podés elegir una fecha, un rango (*hasta la fecha*) o hacerlo **repetir todos los meses o todos los años**. Los eventos repetidos no pueden abarcar varios días ni cruzar la medianoche.

### Sueño
Existe un planeta de **Sueño nocturno** con una línea de resumen por día ("Noche anterior: 23:00 → 07:00 · 8 h") y un acceso rápido para registrar o corregir el sueño.

## Pestañas

| Pestaña | Qué hace |
|---------|----------|
| **Cielo** | Sistema solar animado en `canvas`, bloque "Ahora / luego" en tiempo real y leyenda con horas por planeta. |
| **Bitácora** | Agenda por fecha, navegación semanal, selector de fecha y botón **Hoy**. |
| **Semana** | Edición de la semana regular, día por día. |
| **Planetas** | Alta, edición y baja de planetas. |
| **Balance** | Barras de reparto por planeta, gráfico apilado por día o mes, respaldo de datos y cronograma en PDF. |
| **Cosmos** | El cielo real sobre tu ubicación: Sol, Luna, planetas, estaciones, un mapa de estrellas y el **Oráculo**. |
| **Notas** | Diario con fecha, hora y minuto, y una línea de tiempo para recorrerlo. |

Cielo y Balance se pueden ver por **Semana, Mes o Año**, con navegación entre períodos.

## Cronograma semanal en PDF

En **Balance**, el botón **Cronograma PDF** descarga la semana que estás viendo en *Bitácora* como una hoja A4 apaisada: una grilla de lunes a domingo con las 24 horas, bloques de colores con su título y horario, el día de hoy resaltado y, al pie, las horas de la semana por planeta. Los días anteriores al inicio de la bitácora muestran la semana regular. El archivo se genera en el dispositivo (`orbita-cronograma-AAAA-MM-DD.pdf`), sin servidor ni librerías.

## Cosmos: el cielo mientras vivís tu semana

Una pestaña aparte, pensada para no invadir la agenda. Todo se calcula en el dispositivo, sin conexión, para la fecha y el lugar elegidos:

- **Sol:** primera luz, amanecer, mediodía solar (con su altura), atardecer, última luz, duración del día y noche cerrada. Indica en qué constelación está el Sol y cuándo es el próximo equinoccio o solsticio, con el nombre de la estación según tu hemisferio.
- **Luna:** fase, porcentaje de iluminación, edad, salida y puesta, y las próximas cuatro fases. El dibujo respeta tu hemisferio (en el sur se ve "invertida").
- **Planetas:** Mercurio, Venus, Marte, Júpiter y Saturno, con su constelación, salida y puesta, y los horarios en que se ven de noche.
- **Un día bajo el cielo:** una línea de tiempo que pone tu agenda, la luz del cielo (día, crepúsculos, noche), la Luna y los planetas en las mismas 24 horas.
- **Mapa del cielo:** vista hacia arriba con unas 60 estrellas brillantes, figuras como Orión, la Cruz del Sur y el Triángulo de verano, y un deslizador para recorrer el día. El Este queda a la izquierda, como al mirar el cielo.

La ubicación se configura con el botón **Ubicación** (geolocalización del dispositivo o latitud y longitud a mano) y se guarda aparte de la agenda, bajo la clave `orbita.geo`. Si no la configurás, usa Córdoba, Argentina. Los horarios se muestran en la hora del dispositivo.

**Precisión:** usa elementos orbitales de baja resolución. En pruebas contra valores conocidos de 2026, equinoccios y solsticios coinciden en minutos, y las fases lunares en unos 10 minutos. Las constelaciones se asignan por la longitud eclíptica, así que son aproximadas cerca de los límites.

### Oráculo: qué es propicio y qué conviene con cuidado

Al final de la pestaña **Cosmos**, una lectura simbólica del momento que elegiste (la fecha de arriba y la hora del deslizador del mapa; si estás en "hoy" y no tocaste el deslizador, sigue la hora actual). Muestra un clima general (fluido, mixto o exigente), las claves astrológicas del momento y dos listas: **Propicio** y **Mejor con cuidado**. Combina:

- **Fase lunar** (8 fases) y **signo de la Luna**.
- **Signo del Sol** como tema de fondo.
- **Regente del día** y **hora planetaria** (según el amanecer y el atardecer de tu ubicación).
- **Aspectos de la Luna** a Mercurio, Venus, Marte, Júpiter y Saturno (conjunción, sextil, cuadratura, trígono y oposición).
- **Retrogradaciones** de los cinco planetas.

Usa el zodíaco **tropical** (los signos), distinto de las constelaciones que muestra el resto de Cosmos. Es una lectura para reflexionar, no una predicción. Vive en `js/oraculo.js`, sin dependencias, y se apoya en el motor de `cosmos.js`.

### Notas: un diario del momento

Una pestaña aparte para escribir texto libre que queda registrado con **fecha, día, hora y minuto**.

- **Escribir:** cuadro de texto y botón **Guardar nota** (o `Ctrl + Enter`). Si no tocás la fecha, queda con la hora exacta en que guardás; si querés cargar algo que pasó antes, cambiás la fecha y hora y queda en su lugar.
- **Línea de tiempo:** debajo del cuadro, las notas aparecen de la más nueva a la más vieja, agrupadas por día ("hoy", "ayer") y con la hora de cada una. Cada nota muestra además la fase y el signo de la Luna de ese momento.
- **Encontrar:** buscador (ignora mayúsculas y tildes), selector de día y un mapa de los últimos 30 días donde los días con notas se iluminan; tocás uno para ver solo ese día.
- **Editar o borrar:** tocá una nota para corregir el texto, cambiarle la fecha y hora o eliminarla.
- **Exportar:** botón **Exportar notas (.txt)**. Además, las notas viajan dentro del respaldo JSON de *Balance*.

## Funcionalidades

- Sistema solar animado: órbitas elípticas, tamaño de planeta según las horas, estrellas titilantes y estrellas fugaces. Respeta `prefers-reduced-motion`.
- Bloque **"Ahora"** que se actualiza cada segundo y muestra la actividad actual y la siguiente.
- Número de **semana ISO** y fecha actual en el encabezado.
- Balance con porcentaje de tiempo por planeta, incluyendo "Sin asignar".
- **Tutorial** de 5 pasos al abrir la app por primera vez (y disponible después desde **¿Cómo funciona?**, en el encabezado) que explica cómo cargar tus planetas y tu semana regular.
- **Exportar / importar** respaldo en JSON (`orbita-AAAA-MM-DD.json`). La importación valida y limpia el archivo, y rechaza los que no son de Órbita.
- Migración automática desde versiones anteriores de los datos (`orbita.v4`).
- Cronograma semanal en **PDF** y pestaña **Cosmos** con el cielo de tu ubicación y su **Oráculo**.
- Pestaña **Notas**: diario con fecha y hora, búsqueda y línea de tiempo.
- Interfaz oscura, mobile-first, con barra de pestañas inferior en móvil y superior en escritorio. Cada pestaña tiene su ícono (SVG propio, sin librerías): en el celular la pestaña activa muestra además su nombre; en escritorio se ven ícono y texto siempre. Soporta pantallas con notch.

## Datos y privacidad

Todo se guarda en `localStorage`: la agenda (con las notas) bajo la clave `orbita.v5` y la ubicación del cielo bajo `orbita.geo` (esta no entra en el respaldo JSON). No hay backend, cuentas ni seguimiento, y la ubicación nunca sale del dispositivo.

> ⚠️ Al ser `localStorage`, borrar los datos del navegador borra tu agenda. Usá **Exportar datos** (pestaña *Balance*) para hacer respaldos, sobre todo antes de cambiar de dispositivo.

Al abrir la app por primera vez se carga una **semana de ejemplo** (genérica, sin datos de nadie en particular) con planetas y bloques de muestra, y se abre un **tutorial de 5 pasos** que explica cómo reemplazarla por tu propia semana. Podés editar o borrar los planetas y bloques de ejemplo libremente, y volver a ver el tutorial cuando quieras tocando **¿Cómo funciona?** en el encabezado.

## Stack

- HTML, CSS y JavaScript **vanilla** (sin frameworks ni build)
- `canvas` 2D para el sistema solar, el mapa del cielo y la Luna
- Generador de PDF propio (`js/pdf.js`), motor astronómico propio (`js/cosmos.js`) y oráculo (`js/oraculo.js`), sin dependencias
- `<dialog>` nativo para los editores
- Hosting estático en GitHub Pages; apto para empaquetar como APK Android vía WebView

## Estructura

```
agendasolar/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js        # la app
│   ├── cosmos.js     # astronomía: Sol, Luna, planetas, estrellas
│   ├── oraculo.js    # lectura simbólica del momento cósmico
│   └── pdf.js        # generador del cronograma en PDF
└── README.md
```

## Uso local

```bash
git clone https://github.com/nmftstudio/agendasolar.git
cd agendasolar
npx serve .   # o abrir index.html directamente en el navegador
```

## Modelo de datos (resumen)

```jsonc
{
  "activities": [{ "id", "name", "color", "center" }],  // planetas
  "tpl":  [{ "d", "s", "e", "a", "t" }],                // semana regular (d: 0=lun … 6=dom, s/e en minutos)
  "days": { "AAAA-MM-DD": [{ "s", "e", "a", "t" }] },   // días personalizados o ya registrados
  "rec":  [{ "k": "m|y", "m", "dd", "s", "e", "a", "t" }], // eventos que se repiten
  "frozen": "AAAA-MM-DD",  // último día ya registrado
  "fix":  { "AAAA-MM-DD": 1 }, // días corregidos a mano
  "notes": [{ "id", "t", "x" }], // notas: t = instante en ms (fecha y hora), x = texto
  "start": "AAAA-MM-DD",   // inicio de la bitácora
  "v": 6
}
```

## Créditos

Hecho por **NOMORE** · [Studio NMFT](https://nmft.ar)
