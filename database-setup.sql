-- Script SQL para configurar las tablas del sistema POS en Supabase
-- Ejecuta estos comandos en el SQL Editor de Supabase (uno por uno)

-- Si ya tienes la tabla productos creada, ejecuta SOLO estas líneas para agregar las nuevas columnas:
ALTER TABLE productos ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS notas TEXT;

-- Si necesitas crear la tabla desde cero (SOLO si no existe), usa este bloque:
-- CREATE TABLE productos (
--   id SERIAL PRIMARY KEY,
--   nombre TEXT NOT NULL,
--   precio NUMERIC NOT NULL,
--   stock INTEGER NOT NULL,
--   descripcion TEXT,
--   notas TEXT
-- );

-- =====================================================================================
-- SCRIPT COMPLETO PARA CREAR TODAS LAS TABLAS (Ejecutar si no existen)
-- =====================================================================================

-- Crear tabla productos
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio NUMERIC NOT NULL,
  stock INTEGER NOT NULL,
  descripcion TEXT,
  notas TEXT
);

-- Crear tabla ventas
CREATE TABLE IF NOT EXISTS ventas (
  id SERIAL PRIMARY KEY,
  fecha TIMESTAMP DEFAULT NOW(),
  total NUMERIC NOT NULL
);

-- Crear tabla venta_productos
CREATE TABLE IF NOT EXISTS venta_productos (
  id SERIAL PRIMARY KEY,
  venta_id INTEGER REFERENCES ventas(id),
  producto_id INTEGER REFERENCES productos(id),
  cantidad INTEGER NOT NULL,
  subtotal NUMERIC NOT NULL
);

-- Crear tabla movimientos_caja
CREATE TABLE IF NOT EXISTS movimientos_caja (
  id SERIAL PRIMARY KEY,
  fecha TIMESTAMP DEFAULT NOW(),
  tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'gasto', 'fiado', 'pago_fiado')),
  descripcion TEXT NOT NULL,
  monto NUMERIC NOT NULL,
  categoria TEXT,
  notas TEXT
);

-- Crear tabla clientes
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  fecha_registro TIMESTAMP DEFAULT NOW(),
  notas TEXT
);

-- Crear tabla ventas_fiadas (ventas al fiado)
CREATE TABLE IF NOT EXISTS ventas_fiadas (
  id SERIAL PRIMARY KEY,
  venta_id INTEGER REFERENCES ventas(id),
  cliente_id INTEGER REFERENCES clientes(id),
  fecha_vencimiento DATE,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada', 'vencida')),
  notas TEXT
);

-- Crear tabla pagos_fiados (pagos de deudas)
CREATE TABLE IF NOT EXISTS pagos_fiados (
  id SERIAL PRIMARY KEY,
  venta_fiada_id INTEGER REFERENCES ventas_fiadas(id),
  monto NUMERIC NOT NULL,
  fecha_pago TIMESTAMP DEFAULT NOW(),
  metodo_pago TEXT,
  notas TEXT
);

-- =====================================================================================
-- SCRIPT PARA LIMPIAR COMPLETAMENTE LOS DATOS DE CLIENTES (Ejecutar en SQL Editor de Supabase)
-- ⚠️  ATENCIÓN: Esto eliminará TODOS los datos de clientes y sus deudas ⚠️
-- =====================================================================================

-- Limpiar pagos de fiado
TRUNCATE TABLE pagos_fiados RESTART IDENTITY CASCADE;

-- Limpiar ventas al fiado
TRUNCATE TABLE ventas_fiadas RESTART IDENTITY CASCADE;

-- Limpiar clientes
TRUNCATE TABLE clientes RESTART IDENTITY CASCADE;

-- =====================================================================================
-- SCRIPT PARA RESETEAR TODOS LOS DATOS (Ejecutar en SQL Editor de Supabase)
-- ⚠️  ATENCIÓN: Esto eliminará TODOS los datos permanentemente ⚠️
-- =====================================================================================

-- Resetear tablas con foreign keys primero (en orden inverso de dependencias)
TRUNCATE TABLE pagos_fiados RESTART IDENTITY CASCADE;
TRUNCATE TABLE ventas_fiadas RESTART IDENTITY CASCADE;
TRUNCATE TABLE venta_productos RESTART IDENTITY CASCADE;
TRUNCATE TABLE ventas RESTART IDENTITY CASCADE;
TRUNCATE TABLE movimientos_caja RESTART IDENTITY CASCADE;
TRUNCATE TABLE clientes RESTART IDENTITY CASCADE;
TRUNCATE TABLE productos RESTART IDENTITY CASCADE;

-- =====================================================================================
-- SCRIPT PARA VERIFICAR QUE TODAS LAS TABLAS EXISTEN
-- =====================================================================================

-- Ejecuta esta consulta para verificar que todas las tablas están creadas:
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('productos', 'ventas', 'venta_productos', 'movimientos_caja', 'clientes', 'ventas_fiadas', 'pagos_fiados')
ORDER BY table_name;

-- =====================================================================================
-- SCRIPT PARA CORREGIR RESTRICCIONES EN movimientos_caja (si hay errores)
-- =====================================================================================

-- Ver la restricción actual
-- SELECT conname, conrelid::regclass, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'movimientos_caja'::regclass AND contype = 'c';

-- Corregir la restricción si es necesario
-- ALTER TABLE movimientos_caja DROP CONSTRAINT IF EXISTS movimientos_caja_tipo_check;
-- ALTER TABLE movimientos_caja ADD CONSTRAINT movimientos_caja_tipo_check CHECK (tipo IN ('ingreso', 'gasto', 'fiado', 'pago_fiado'));

-- =====================================================================================
-- TABLAS DE AUTENTICACIÓN Y ROLES
-- =====================================================================================

-- Crear tabla roles
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla user_roles (relaciona usuarios de auth.users con roles)
CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role_id)
);

-- Insertar roles por defecto
INSERT INTO roles (name, description) VALUES
  ('admin', 'Administrador con acceso completo al sistema'),
  ('cajero', 'Cajero con acceso limitado para operaciones diarias')
ON CONFLICT (name) DO NOTHING;

-- =====================================================================================
-- POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
-- =====================================================================================

-- Habilitar RLS en las tablas
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas para roles (todos pueden leer)
CREATE POLICY "Roles are viewable by authenticated users" ON roles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para user_roles
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Admins can manage user roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- =====================================================================================
-- FUNCIONES HELPER PARA AUTENTICACIÓN
-- =====================================================================================

-- Función para verificar si un usuario tiene un rol específico
CREATE OR REPLACE FUNCTION has_role(user_uuid UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid AND r.name = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener los roles de un usuario
CREATE OR REPLACE FUNCTION get_user_roles(user_uuid UUID)
RETURNS TABLE(role_name TEXT, role_description TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT r.name, r.description
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================================
-- SCRIPT PARA VERIFICAR QUE LAS TABLAS DE AUTENTICACIÓN EXISTEN
-- =====================================================================================

-- Ejecuta esta consulta para verificar que las tablas de autenticación están creadas:
SELECT
  table_name,
  table_schema
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('roles', 'user_roles')
ORDER BY table_name;