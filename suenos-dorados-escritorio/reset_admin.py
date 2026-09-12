"""
reset_admin.py — Script de recuperación del administrador por defecto
=====================================================================
Úsalo cuando:
  - La API NestJS no arranca y no puedes usar el seeding automático.
  - El hash en la BD se corrompió y no puedes iniciar sesión.
  - Migraste la BD a un nuevo entorno y necesitas recrear el admin.

Requisitos:
  pip install bcrypt psycopg2-binary python-dotenv

Ejecución:
  python reset_admin.py

El script lee las variables de conexión desde el archivo .env
que está en la misma carpeta que este script.
"""

import os
import sys

import bcrypt
import psycopg2
from dotenv import load_dotenv

# ── Configuración ────────────────────────────────────────────────────────────
# Carga el .env del proyecto de escritorio (misma carpeta)
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Credenciales de conexión a PostgreSQL
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "suenos_dorados")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "")

# Credenciales del administrador por defecto — NO cambiar
ADMIN_EMAIL     = "admin@gmail.com"
ADMIN_PASSWORD  = "admin1234"
ADMIN_NOMBRE    = "Admin"
ADMIN_APELLIDO  = "Maestro"
ADMIN_ID_ROL    = 1          # Rol Administrador


# ── Helpers ──────────────────────────────────────────────────────────────────

def conectar():
    """Retorna una conexión psycopg2 usando las vars del .env."""
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=int(DB_PORT),
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
        )
        conn.autocommit = False
        return conn
    except psycopg2.OperationalError as exc:
        print(f"❌ No se pudo conectar a PostgreSQL: {exc}")
        print(f"   Host: {DB_HOST}:{DB_PORT}  DB: {DB_NAME}  User: {DB_USER}")
        sys.exit(1)


def generar_hash(password: str) -> str:
    """
    Genera un hash bcrypt compatible con el que usa NestJS (bcrypt, 10 rounds).
    El resultado es directamente comparable con bcrypt.compare() de Node.js.
    """
    salt = bcrypt.gensalt(rounds=10)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


# ── Lógica principal ─────────────────────────────────────────────────────────

def seed_roles(cur):
    """Inserta los roles base si no existen."""
    cur.execute("""
        INSERT INTO roles (id_rol, descripcion_rol)
        VALUES (1, 'Administrador')
        ON CONFLICT (id_rol) DO NOTHING
    """)
    cur.execute("""
        INSERT INTO roles (id_rol, descripcion_rol)
        VALUES (2, 'Cliente')
        ON CONFLICT (id_rol) DO NOTHING
    """)
    print("   ✔ Roles verificados (Administrador, Cliente)")


def reset_admin(cur):
    """
    Crea el usuario administrador si no existe, o actualiza su hash
    si ya existe. Garantiza que siempre pueda iniciar sesión.
    """
    nuevo_hash = generar_hash(ADMIN_PASSWORD)

    # Verificar si el admin ya existe
    cur.execute(
        "SELECT id_usuario, contrasena_hash FROM usuarios WHERE correo_electronico = %s",
        (ADMIN_EMAIL,),
    )
    fila = cur.fetchone()

    if fila is None:
        # ── Crear desde cero
        cur.execute("""
            INSERT INTO usuarios
                (id_rol, nombre_usuario, apellido_usuario, correo_electronico,
                 contrasena_hash, estado, fecha_registro)
            VALUES (%s, %s, %s, %s, %s, TRUE, NOW())
        """, (ADMIN_ID_ROL, ADMIN_NOMBRE, ADMIN_APELLIDO, ADMIN_EMAIL, nuevo_hash))
        print(f"   ✔ Admin creado: {ADMIN_EMAIL}")
    else:
        id_usuario, hash_actual = fila
        # Verificar si el hash actual ya valida la contraseña correctamente
        hash_ok = bcrypt.checkpw(ADMIN_PASSWORD.encode("utf-8"), hash_actual.encode("utf-8"))
        if hash_ok:
            print(f"   ✔ Admin ya existe con hash válido — no se modifica ({ADMIN_EMAIL})")
            return
        # Hash corrupto o incompatible: actualizar
        cur.execute(
            "UPDATE usuarios SET contrasena_hash = %s, estado = TRUE WHERE id_usuario = %s",
            (nuevo_hash, id_usuario),
        )
        print(f"   ✔ Hash del admin actualizado (id={id_usuario}, {ADMIN_EMAIL})")


def main():
    print("=" * 55)
    print("  Sueños Dorados — Reset / Seed del Administrador")
    print("=" * 55)
    print(f"  Base de datos : {DB_NAME} @ {DB_HOST}:{DB_PORT}")
    print(f"  Admin email   : {ADMIN_EMAIL}")
    print(f"  Contraseña    : {ADMIN_PASSWORD}")
    print("=" * 55)

    conn = conectar()
    print(f"\n✅ Conexión exitosa a '{DB_NAME}'\n")

    try:
        with conn.cursor() as cur:
            seed_roles(cur)
            reset_admin(cur)
        conn.commit()
        print("\n✅ Operación completada. Ya puedes iniciar sesión con:")
        print(f"   Correo     : {ADMIN_EMAIL}")
        print(f"   Contraseña : {ADMIN_PASSWORD}\n")
    except Exception as exc:
        conn.rollback()
        print(f"\n❌ Error — se hizo rollback: {exc}")
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
