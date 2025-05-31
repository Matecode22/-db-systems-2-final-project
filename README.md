# Trackademic - Sistema de Gestión de Notas Académicas

Una aplicación web para gestionar notas universitarias, planes de evaluación y generar informes académicos.

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta en MongoDB Atlas (o MongoDB local)
- Cuenta en Supabase

### 1. Clonar e instalar dependencias

\`\`\`bash
# Instalar dependencias
npm install --legacy-peer-deps
\`\`\`

> **⚠️ Nota Importante:** Este proyecto usa React 19 y algunas dependencias pueden tener conflictos de versiones. Si encuentras errores de dependencias peer, usa `--legacy-peer-deps` para resolverlos.

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio_de_supabase

# MongoDB
MONGODB_URI=tu_uri_de_mongodb

# NextAuth
NEXTAUTH_SECRET=tu-clave-secreta-muy-segura
NEXTAUTH_URL=http://localhost:3000
\`\`\`

### 3. Ejecutar en desarrollo

\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

### 4. Poblar la base de datos (opcional)

Visita [http://localhost:3000/admin](http://localhost:3000/admin) y haz clic en "Poblar Base de Datos" para cargar datos de ejemplo.

## 🔧 Solución de Problemas Comunes

### Error de Dependencias (ERESOLVE)

Si encuentras errores como:
```
npm error ERESOLVE could not resolve
```

**Solución:**
```bash
# Para instalar nuevas dependencias
npm install nombre-paquete --legacy-peer-deps

# Para reinstalar todas las dependencias
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**¿Por qué ocurre esto?**
- El proyecto usa React 19 (muy reciente)
- Algunas librerías como `vaul`, `react-day-picker` aún no soportan oficialmente React 19
- `--legacy-peer-deps` usa el algoritmo de resolución de dependencias de npm v6 (más permisivo)

### Problemas de Conexión a Bases de Datos

Si MongoDB o Supabase no se conectan:
1. Verifica las variables de entorno en `.env.local`
2. Asegúrate de que las URLs y claves sean correctas
3. El sistema tiene fallbacks automáticos para desarrollo

## 👤 Usuarios de Prueba

Después de poblar la base de datos:

- **Email:** juan.perez@estudiante.edu.co  
  **Contraseña:** 123456

- **Email:** maria.gonzalez@estudiante.edu.co  
  **Contraseña:** 123456

## 🏗️ Estructura del Proyecto

\`\`\`
trackademic/
├── app/                    # Páginas y rutas de Next.js 14
├── components/             # Componentes reutilizables
├── lib/                    # Configuraciones y utilidades
├── scripts/                # Scripts de inicialización
└── public/                 # Archivos estáticos
\`\`\`

## 🛠️ Tecnologías

- **Frontend:** Next.js 14, React 19, TypeScript, Tailwind CSS
- **UI:** shadcn/ui, Radix UI
- **Autenticación:** NextAuth.js
- **Bases de Datos:** Supabase (PostgreSQL) + MongoDB
- **Deployment:** Vercel

## 📊 Funcionalidades

- ✅ Sistema de autenticación
- ✅ Gestión de planes de evaluación
- ✅ Cálculo inteligente de notas
- ✅ Sistema colaborativo con comentarios
- ✅ Informes y estadísticas
- ✅ Dashboard interactivo
- ✅ Calculadora de notas requeridas

## 🔧 Scripts Disponibles

- `npm run dev` - Ejecutar en desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Ejecutar en producción
- `npm run seed` - Poblar base de datos con datos de ejemplo
\`\`\`

## 📝 Notas para Desarrolladores

### Manejo de Dependencias
- Siempre usar `--legacy-peer-deps` para instalar nuevos paquetes
- Las versiones están fijadas para evitar conflictos
- React 19 requiere Node.js 18+

### Base de Datos Híbrida
- **PostgreSQL (Supabase):** Datos estructurados de la universidad
- **MongoDB:** Datos flexibles (planes, notas, comentarios)
- Fallbacks automáticos implementados para desarrollo

### Desarrollo Local
```bash
# Instalar dependencias (primera vez)
npm install --legacy-peer-deps

# Agregar nueva dependencia
npm install nueva-dependencia --legacy-peer-deps

# Limpiar y reinstalar (si hay problemas)
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

Finalmente, vamos a crear un script de inicio rápido:
