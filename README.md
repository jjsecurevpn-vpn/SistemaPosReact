# Sistema POS React

Sistema de Punto de Venta moderno, rápido y seguro, desarrollado con **React**, **TypeScript**, **Vite**, **Supabase** y **TailwindCSS**.

## Características principales

- **Autenticación y roles**: Login seguro con Supabase, soporte para roles de _admin_ y _cajero_.
- **Gestión de productos**: CRUD de productos con inventario, descripciones y notas.
- **Gestión de clientes**: Alta, edición y eliminación de clientes, historial de ventas fiadas y pagos.
- **Control de caja**: Registro de ingresos, gastos, movimientos fiados y pagos fiados.
- **Reportes**: Visualización de ventas diarias, ventas fiadas y estadísticas clave.
- **Interfaz responsiva**: UI minimalista, adaptable a dispositivos móviles y escritorio.
- **Permisos**: Los cajeros solo pueden registrar ventas y pagos, los admins pueden editar/eliminar todo.

## Estructura del proyecto

```
├── src/
│   ├── components/      # Componentes UI (Header, Sidebar, Login, Modal, etc.)
│   ├── hooks/           # Hooks personalizados (useAuth, useProducts, useCaja, useClientes, useReports)
│   ├── lib/             # Configuración de Supabase
│   ├── pages/           # Vistas principales (POS, Productos, Clientes, Caja, Reportes)
│   ├── utils/           # Funciones y tipos auxiliares
│   ├── assets/          # Imágenes y recursos
│   ├── index.css        # Estilos globales con Tailwind
│   └── main.tsx         # Punto de entrada de la app
├── public/              # Archivos estáticos
├── database-setup.sql   # Script para crear tablas y funciones en Supabase
├── package.json         # Dependencias y scripts
├── tailwind.config.js   # Configuración de Tailwind
├── vite.config.ts       # Configuración de Vite
└── .env                 # Variables de entorno (Supabase)
```

## Instalación y configuración

1. **Clona el repositorio:**

```bash
git clone https://github.com/jjsecurevpn-vpn/SistemaPosReact.git
cd SistemaPosReact
```

2. **Instala dependencias:**

```bash
npm install
```

3. **Configura Supabase:**

- Crea un proyecto en [Supabase](https://supabase.com).
- Copia tu `VITE_SUPABASE_URL` y `VITE_SUPABASE_KEY` en el archivo `.env`.

4. **Configura la base de datos:**

- Abre el archivo `database-setup.sql`.
- Ejecuta el contenido en el SQL Editor de Supabase para crear tablas, roles y funciones.

5. **Inicia la app:**

```bash
npm run dev
```

## Scripts útiles

- `npm run dev` — Inicia el servidor de desarrollo.
- `npm run build` — Compila la app para producción.
- `npm run lint` — Ejecuta ESLint para revisar el código.
- `npm run preview` — Previsualiza la app compilada.

## Roles y permisos

- **Admin:** Acceso total, puede editar/eliminar productos, clientes y movimientos de caja.
- **Cajero:** Solo puede registrar ventas y pagos, no puede modificar ni eliminar datos.

## Tecnologías usadas

- **React 19**
- **TypeScript**
- **Vite**
- **Supabase** (auth, base de datos, RLS)
- **TailwindCSS**
- **Lucide React Icons**
- **React Icons**

## Personalización

- Modifica los colores y estilos en `tailwind.config.js`.
- Agrega o ajusta tablas y funciones en `database-setup.sql` según tus necesidades.

## Seguridad

- Autenticación y autorización con Supabase y Row Level Security (RLS).
- Variables sensibles en `.env` (no subir a GitHub).

## Contribuciones

¡Se aceptan PRs y sugerencias! Abre un issue o envía tu mejora.
