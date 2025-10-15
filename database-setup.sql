-- Script SQL para configurar las tablas del sistema POS en Supabase
-- Ejecuta estos comandos en el SQL Editor de Supabase (uno por uno)

-- Crear tabla productos
CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio NUMERIC NOT NULL,
  stock INTEGER NOT NULL
);

-- Crear tabla ventas
CREATE TABLE ventas (
  id SERIAL PRIMARY KEY,
  fecha TIMESTAMP DEFAULT NOW(),
  total NUMERIC NOT NULL
);

-- Crear tabla venta_productos
CREATE TABLE venta_productos (
  id SERIAL PRIMARY KEY,
  venta_id INTEGER REFERENCES ventas(id),
  producto_id INTEGER REFERENCES productos(id),
  cantidad INTEGER NOT NULL,
  subtotal NUMERIC NOT NULL
);

-- Insertar algunos productos de ejemplo (opcional)
INSERT INTO productos (nombre, precio, stock) VALUES
('Producto A', 10.50, 100),
('Producto B', 25.00, 50),
('Producto C', 5.75, 200),
('Producto D', 15.00, 75);