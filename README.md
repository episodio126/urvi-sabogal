# 🏥 Unidad de Radiología Vascular e Intervencionista — HNASS

Página web informativa para pacientes de la Unidad de Radiología Vascular e Intervencionista del Hospital Nacional Alberto Sabogal Sologuren (EsSalud).

## 📁 Estructura

```
/
├── index.html              # Página pública (bienvenida + grid de procedimientos)
├── procedimiento.html      # Detalle del procedimiento (video 9:16 + FAQs)
├── css/
│   └── styles.css          # Estilos EsSalud (blanco + azul, responsivo)
├── js/
│   ├── firebase-config.js  # Configuración Firestore
│   ├── app.js              # Lógica pública
│   ├── auth.js             # Autenticación simple por DNI
│   └── admin.js            # Dashboard de procedimientos
└── admin/
    ├── login.html          # Login (DNI + contraseña)
    ├── dashboard.html      # CRUD de procedimientos + config general
    └── usuarios.html       # Gestión de usuarios (solo admin)
```

## 🚀 Tecnologías

- **Frontend:** HTML5 + CSS3 + Vanilla JS
- **Hosting:** GitHub Pages (gratuito)
- **Base de datos:** Firebase Firestore (gratuito)
- **Videos:** YouTube embebido (gratuito, formato 9:16 vertical)
- **Autenticación:** Simple por DNI + contraseña (almacenado en Firestore, sin Firebase Auth)

## 🔧 Configuración paso a paso

### 1. Crear proyecto en Firebase
1. Ir a [console.firebase.google.com](https://console.firebase.google.com)
2. Crear proyecto nuevo: `hnass-radiologia-vascular`
3. **NO** habilitar Google Analytics

### 2. Registrar app Web
1. En el proyecto, clic en **</> (Web)**
2. Nickname: `rvii-web`
3. **NO** seleccionar Firebase Hosting
4. Copiar el objeto `firebaseConfig` y pegarlo en `js/firebase-config.js`

### 3. Activar Firestore Database
1. Ir a **Build** → **Firestore Database**
2. Crear base de datos → **Modo de prueba**
3. Ubicación: `nam5 (us-central)` o la más cercana

### 4. Configurar reglas de seguridad
En Firestore Database → **Reglas**, pegar:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /configuracion/{doc} {
      allow read, write: if true;
    }
    match /procedimientos/{doc} {
      allow read, write: if true;
    }
    match /usuarios/{doc} {
      allow read, write: if true;
    }
  }
}
```

> **Nota:** Estas reglas son abiertas para uso interno/hospitalario. Si deseas restringir en el futuro, puedes agregar validaciones.

### 5. Crear usuario admin por defecto
En Firestore Database → **Colección `usuarios`** → **Agregar documento**:

| Campo      | Tipo    | Valor           |
|------------|---------|-----------------|
| `nombre`   | string  | Administrador   |
| `dni`      | string  | admin           |
| `password` | string  | admin2026       |
| `rol`      | string  | admin           |
| `activo`   | boolean | true            |

### 6. Crear configuración general
En Firestore Database → **Colección `configuracion`** → **Documento `general`**:

| Campo               | Tipo   | Valor (ejemplo)                                      |
|---------------------|--------|------------------------------------------------------|
| `mensajeBienvenida` | string  | Bienvenido a la Unidad de Radiología Vascular...     |
| `telefonoContacto`  | string  | 01 123-4567                                          |
| `emailContacto`     | string  | radiologia.vascular@hnass.gob.pe                     |

### 7. Subir a GitHub Pages
1. Crear repositorio en GitHub: `rvii-hnass`
2. Subir todos los archivos con la estructura indicada
3. Ir a **Settings** → **Pages** → Source: **Deploy from a branch** → **main** → **/ (root)**
4. El sitio estará en: `https://TUUSUARIO.github.io/rvii-hnass/`

## 👤 Acceso

### Página pública
- Acceso libre para pacientes
- No requiere login

### Panel administrativo
- URL: `https://TUUSUARIO.github.io/rvii-hnass/admin/login.html`
- **Usuario por defecto:** `admin`
- **Contraseña por defecto:** `admin2026`

### Roles
- **admin:** Puede gestionar procedimientos, configuración y usuarios
- **editor:** Puede gestionar procedimientos y configuración (NO usuarios)

## 📹 Subir videos

1. Subir el video a YouTube (desde la cuenta institucional o personal designada)
2. Configurar como **"No listado"** (no aparece en búsquedas, pero se puede reproducir)
3. Copiar el enlace del video
4. En el panel admin, crear/editar procedimiento y pegar el URL de YouTube

## 🎨 Características del diseño

- **Colores:** EsSalud (blanco + azul #0056b3)
- **Responsivo:** Optimizado para celular, tablet y desktop
- **Videos:** Formato vertical 9:16 (ideal para móviles)
- **FAQs:** Preguntas frecuentes personalizadas por procedimiento
- **Contacto:** Teléfono y email configurables desde el admin

## ⚠️ Notas importantes

- Las contraseñas se almacenan en texto plano en Firestore (por simplicidad). Para mayor seguridad en el futuro, considerar encriptación.
- La sesión se guarda en `sessionStorage` (se pierde al cerrar la pestaña).
- YouTube no cobra por almacenar ni reproducir videos.
- Firebase Spark (gratuito) permite hasta 50,000 lecturas/escrituras diarias, suficiente para este uso.

## 📞 Soporte

Para dudas técnicas, contactar al área de Tecnología de la Información del HNASS.

---

**© 2026 Hospital Nacional Alberto Sabogal Sologuren — EsSalud**
**Unidad de Radiología Vascular e Intervencionista**