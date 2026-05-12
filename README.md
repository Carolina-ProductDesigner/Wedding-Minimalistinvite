# 💒 Camila & Romina — Wedding Invitation

Invitación de bodas minimalista y elegante, 100% responsiva para mobile y desktop.  
Construida con HTML, CSS y JavaScript vanilla. Sin dependencias. Lista para Vercel.

---

## 🗂 Estructura del proyecto

```
wedding-invite/
├── index.html                  ← Página principal
├── src/
│   ├── styles/
│   │   └── main.css            ← Todos los estilos
│   ├── components/
│   │   └── main.js             ← Toda la lógica JS
│   └── assets/                 ← Imágenes (agregar manualmente)
│       ├── photo1.jpg
│       ├── photo2.jpg
│       ├── hotel1.jpg
│       ├── hotel2.jpg
│       ├── hero.jpg
│       ├── hotel-bg.jpg
│       ├── rsvp-bg.jpg
│       ├── amazon.svg
│       └── palacio.svg
└── google-apps-script/
    └── Code.gs                 ← Script para Google Sheets (RSVP)
```

---

## 🚀 Deploy en Vercel (paso a paso)

### 1. Subir a GitHub

1. Crea un repositorio nuevo en [github.com](https://github.com/new)  
2. Sube **todas las carpetas y archivos** tal como están
3. Asegúrate de que `index.html` esté en la raíz del repositorio

### 2. Conectar Vercel

1. Ve a [vercel.com](https://vercel.com) y conecta tu cuenta de GitHub
2. Haz clic en **"Add New Project"**
3. Selecciona tu repositorio
4. En configuración:
   - **Framework Preset:** `Other`
   - **Root Directory:** `/` (raíz)
   - **Build Command:** *(dejar vacío)*
   - **Output Directory:** *(dejar vacío)*
5. Haz clic en **Deploy** ✓

---

## 📸 Agregar las fotos

Coloca tus fotos en `src/assets/` con estos nombres exactos:

| Archivo | Descripción |
|---|---|
| `photo1.jpg` | Foto lateral izquierda de las novias |
| `photo2.jpg` | Foto lateral derecha de las novias |
| `hero.jpg` | Fondo sección "Nuestra Historia" |
| `hotel-bg.jpg` | Fondo sección "Hospedaje" |
| `rsvp-bg.jpg` | Fondo oscuro sección "Confirmar Asistencia" |
| `hotel1.jpg` | Foto Hotel Hilton Reforma |
| `hotel2.jpg` | Foto Hotel Emporio |
| `amazon.svg` | Logo Amazon (opcional, se puede dejar como texto) |
| `palacio.svg` | Logo El Palacio de Hierro (opcional) |

> 💡 **Recomendación de tamaños:** Fotos principales 800×1200px, fondos 1920×1080px mínimo.

---

## 📊 Configurar Google Sheets (RSVP)

### Paso 1 — Crear la hoja

1. Ve a [sheets.google.com](https://sheets.google.com) y crea una nueva hoja
2. Dale un nombre (ej: "RSVP Boda C&R")

### Paso 2 — Apps Script

1. En la hoja, ve a **Extensiones → Apps Script**
2. Borra todo el código existente
3. Copia el contenido de `google-apps-script/Code.gs` y pégalo
4. Guarda con `Ctrl+S`

### Paso 3 — Implementar

1. Haz clic en **"Implementar"** (arriba a la derecha)
2. Selecciona **"Nueva implementación"**
3. En el ícono de configuración, elige **"Aplicación web"**
4. Configuración:
   - **Descripción:** RSVP Boda
   - **Ejecutar como:** Tu cuenta
   - **Quién tiene acceso:** Cualquier usuario
5. Haz clic en **"Implementar"**
6. Acepta los permisos de Google
7. **Copia la URL** que aparece (termina en `/exec`)

### Paso 4 — Conectar con la invitación

En `src/components/main.js`, línea 6:

```js
// ANTES:
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec';

// DESPUÉS (pega tu URL):
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycby.../exec';
```

---

## ✏️ Personalizar el contenido

Toda la información de los eventos, hoteles y contactos se edita directamente en `index.html`.

### Cambiar nombres
Busca `Camila & Romina` y reemplaza con los nombres correctos.

### Cambiar fecha
Busca `03 09 2024` y `03 · 09 · 2024` y actualiza.

### Cambiar colores (opcional)
En `src/styles/main.css`, las primeras líneas tienen las variables de color:

```css
:root {
  --cream: #f5f0ea;       /* Fondo principal */
  --charcoal: #2a2520;    /* Texto oscuro */
  --stone: #8c8078;       /* Texto secundario */
  --sand: #c9bfb0;        /* Líneas y acentos suaves */
  --accent: #9b8e7a;      /* Acento principal */
  --dark: #1a1610;        /* Pantalla intro y RSVP */
}
```

### Mesa de regalos — BBVA (transferencia)
En `index.html`, busca el bloque `regalo__bank-info` y actualiza:
- Nombre del titular
- CLABE interbancaria
- Concepto

### Número de WhatsApp
Busca `https://wa.me/521XXXXXXXXXX` y reemplaza con el número correcto (formato internacional sin `+`).

---

## 🎨 Funcionalidades incluidas

- ✅ Pantalla intro con efecto typewriter
- ✅ Navegación por secciones con swipe (móvil) y flechas teclado
- ✅ Menú hamburguesa animado para móvil
- ✅ Efecto parallax en imágenes (desktop)
- ✅ Animaciones "fade in" al cambiar de sección
- ✅ Formulario RSVP conectado a Google Sheets
- ✅ Confirmación visual de envío exitoso
- ✅ 100% responsivo (mobile first)
- ✅ Sin dependencias externas

---

## 🛠 Desarrollo local

Simplemente abre `index.html` en tu navegador, o usa:

```bash
npx serve .
```

o con Python:

```bash
python3 -m http.server 3000
```

---

*Con amor para Camila & Romina — 03.09.2024* 🤍
