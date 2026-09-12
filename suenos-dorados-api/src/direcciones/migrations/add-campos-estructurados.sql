-- ============================================================
-- Migración: Campos estructurados en tabla direcciones
-- Ejecutar UNA VEZ en PostgreSQL antes de reiniciar la API
-- ============================================================

ALTER TABLE direcciones
  ADD COLUMN IF NOT EXISTS nombre_destinatario   VARCHAR(160),
  ADD COLUMN IF NOT EXISTS telefono_contacto     VARCHAR(25),
  ADD COLUMN IF NOT EXISTS documento_identidad   VARCHAR(30),
  ADD COLUMN IF NOT EXISTS pais                  VARCHAR(80)  NOT NULL DEFAULT 'Colombia',
  ADD COLUMN IF NOT EXISTS codigo_postal         VARCHAR(15),
  ADD COLUMN IF NOT EXISTS complemento           VARCHAR(120),
  ADD COLUMN IF NOT EXISTS indicaciones          TEXT,
  ADD COLUMN IF NOT EXISTS etiqueta              VARCHAR(30)  NOT NULL DEFAULT 'Casa';

-- Confirmar estructura final
SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'direcciones'
ORDER BY ordinal_position;
