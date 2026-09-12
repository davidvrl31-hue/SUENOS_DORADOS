-- =============================================================
-- reset_admin.sql — Sueños Dorados
-- Fallback manual para cuando el hash se corrompe o no existe
-- el usuario administrador.
--
-- INSTRUCCIONES:
--   1. Ejecuta este script en pgAdmin, DBeaver o psql.
--   2. El hash incluido corresponde a: admin1234 (bcrypt, 10 rounds)
--      y es 100% compatible con bcrypt.compare() de Node.js.
--
-- NOTA: Si necesitas regenerar el hash (por ejemplo, para cambiar
--       la contraseña), usa el script Python:
--         python suenos-dorados-escritorio/reset_admin.py
-- =============================================================

-- ── 1. Garantizar roles base ──────────────────────────────────
INSERT INTO roles (id_rol, descripcion_rol)
VALUES (1, 'Administrador')
ON CONFLICT (id_rol) DO NOTHING;

INSERT INTO roles (id_rol, descripcion_rol)
VALUES (2, 'Cliente')
ON CONFLICT (id_rol) DO NOTHING;

-- ── 2. Actualizar hash si el admin ya existe ──────────────────
-- Hash bcrypt de "admin1234" con 10 rounds.
-- Compatible con Node.js bcrypt.compare().
UPDATE usuarios
SET
    contrasena_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    estado          = TRUE,
    id_rol          = 1
WHERE correo_electronico = 'admin@gmail.com';

-- ── 3. Crear el admin si NO existe ───────────────────────────
-- (el UPDATE anterior no hace nada si no hay fila; este INSERT la crea)
INSERT INTO usuarios
    (id_rol, nombre_usuario, apellido_usuario, correo_electronico,
     contrasena_hash, estado, fecha_registro)
SELECT
    1,
    'Admin',
    'Maestro',
    'admin@gmail.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    TRUE,
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE correo_electronico = 'admin@gmail.com'
);

-- ── Verificación ──────────────────────────────────────────────
SELECT
    id_usuario,
    correo_electronico,
    nombre_usuario,
    id_rol,
    estado,
    LEFT(contrasena_hash, 20) || '…' AS hash_preview
FROM usuarios
WHERE correo_electronico = 'admin@gmail.com';
