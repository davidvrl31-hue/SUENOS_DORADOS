-- Ejecutar este script en PostgreSQL para crear las tablas de pedidos
-- Base de datos: suenosdorados

CREATE TABLE IF NOT EXISTS pedidos (
  id_pedido          SERIAL PRIMARY KEY,
  id_usuario         INT NOT NULL,
  estado_pedido      VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  total              NUMERIC(12, 2) NOT NULL,
  direccion_entrega  TEXT,
  notas              TEXT,
  fecha_pedido       TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_pedido_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS detalle_pedidos (
  id_detalle       SERIAL PRIMARY KEY,
  id_pedido        INT NOT NULL,
  id_variante      INT NOT NULL,
  nombre_producto  VARCHAR(200) NOT NULL,
  cantidad         INT NOT NULL,
  precio_unitario  NUMERIC(12, 2) NOT NULL,
  subtotal         NUMERIC(12, 2) NOT NULL,
  CONSTRAINT fk_detalle_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_variante FOREIGN KEY (id_variante) REFERENCES variantes_producto(id_variante)
);
