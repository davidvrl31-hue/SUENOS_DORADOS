"""
Cliente HTTP hacia la API NestJS de Sueños Dorados.

Toda la app de escritorio usa este módulo en lugar de conectarse
directamente a PostgreSQL via SQLAlchemy.
"""
import os
from typing import Any

import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("NEST_API_URL", "http://localhost:3000")

# Token JWT del administrador (se actualiza al hacer login)
_token: str | None = None


def _headers() -> dict:
    headers = {"Content-Type": "application/json"}
    if _token:
        headers["Authorization"] = f"Bearer {_token}"
    return headers


def _url(path: str) -> str:
    return f"{BASE_URL}/{path.lstrip('/')}"


def _handle(response: requests.Response) -> Any:
    try:
        response.raise_for_status()
    except requests.HTTPError as exc:
        try:
            detail = response.json().get("message", str(exc))
        except Exception:
            detail = str(exc)
        raise RuntimeError(detail) from exc
    if response.status_code == 204 or not response.content:
        return None
    return response.json()


# ─────────────────────────────────────────────
# AUTH
# ─────────────────────────────────────────────

def login(correo: str, password: str) -> dict:
    """Autentica al administrador y almacena el token JWT."""
    global _token
    data = _handle(requests.post(_url("auth/login"), json={
        "correoElectronico": correo,
        "contrasena": password,
    }, headers=_headers()))
    _token = data.get("access_token")
    return data


def logout():
    global _token
    _token = None


# ─────────────────────────────────────────────
# DASHBOARD
# ─────────────────────────────────────────────

def dashboard_stats() -> dict:
    return _handle(requests.get(_url("admin/dashboard"), headers=_headers()))


def dashboard_chart_ventas() -> list:
    return _handle(requests.get(_url("admin/dashboard/ventas"), headers=_headers())) or []


def dashboard_chart_usuarios() -> list:
    return _handle(requests.get(_url("admin/dashboard/usuarios"), headers=_headers())) or []


def dashboard_pedidos_estado() -> list:
    return _handle(requests.get(_url("admin/dashboard/pedidos-estado"), headers=_headers())) or []


# ─────────────────────────────────────────────
# CATEGORÍAS
# ─────────────────────────────────────────────

def listar_categorias() -> list:
    return _handle(requests.get(_url("categorias"), headers=_headers()))


def crear_categoria(data: dict) -> dict:
    return _handle(requests.post(_url("categorias"), json=data, headers=_headers()))


def actualizar_categoria(id_: int, data: dict) -> dict:
    return _handle(requests.patch(_url(f"categorias/{id_}"), json=data, headers=_headers()))


def eliminar_categoria(id_: int) -> dict:
    return _handle(requests.delete(_url(f"categorias/{id_}"), headers=_headers()))


# ─────────────────────────────────────────────
# PRODUCTOS
# ─────────────────────────────────────────────

def listar_productos(id_categoria: int | None = None) -> list:
    params = {}
    if id_categoria is not None:
        params["idCategoria"] = id_categoria
    return _handle(requests.get(_url("productos"), params=params, headers=_headers()))


def obtener_producto(id_: int) -> dict:
    return _handle(requests.get(_url(f"productos/{id_}"), headers=_headers()))


def crear_producto(data: dict) -> dict:
    return _handle(requests.post(_url("productos"), json=data, headers=_headers()))


def actualizar_producto(id_: int, data: dict) -> dict:
    return _handle(requests.patch(_url(f"productos/{id_}"), json=data, headers=_headers()))


def eliminar_producto(id_: int) -> dict:
    return _handle(requests.delete(_url(f"productos/{id_}"), headers=_headers()))


# ─────────────────────────────────────────────
# COLORES
# ─────────────────────────────────────────────

def listar_colores() -> list:
    return _handle(requests.get(_url("colores"), headers=_headers()))


def crear_color(data: dict) -> dict:
    return _handle(requests.post(_url("colores"), json=data, headers=_headers()))


def actualizar_color(id_: int, data: dict) -> dict:
    return _handle(requests.patch(_url(f"colores/{id_}"), json=data, headers=_headers()))


def eliminar_color(id_: int) -> dict:
    return _handle(requests.delete(_url(f"colores/{id_}"), headers=_headers()))


# ─────────────────────────────────────────────
# MEDIDAS
# ─────────────────────────────────────────────

def listar_medidas() -> list:
    return _handle(requests.get(_url("medidas"), headers=_headers()))


def crear_medida(data: dict) -> dict:
    return _handle(requests.post(_url("medidas"), json=data, headers=_headers()))


def actualizar_medida(id_: int, data: dict) -> dict:
    return _handle(requests.patch(_url(f"medidas/{id_}"), json=data, headers=_headers()))


def eliminar_medida(id_: int) -> dict:
    return _handle(requests.delete(_url(f"medidas/{id_}"), headers=_headers()))


# ─────────────────────────────────────────────
# VARIANTES / INVENTARIO
# ─────────────────────────────────────────────

def listar_variantes(id_producto: int | None = None) -> list:
    params = {}
    if id_producto is not None:
        params["idProducto"] = id_producto
    return _handle(requests.get(_url("variantes-producto"), params=params, headers=_headers()))


def obtener_variante(id_: int) -> dict:
    return _handle(requests.get(_url(f"variantes-producto/{id_}"), headers=_headers()))


def crear_variante(data: dict) -> dict:
    return _handle(requests.post(_url("variantes-producto"), json=data, headers=_headers()))


def actualizar_variante(id_: int, data: dict) -> dict:
    return _handle(requests.patch(_url(f"variantes-producto/{id_}"), json=data, headers=_headers()))


def ajustar_stock(id_variante: int, delta: int, referencia: str = "AJUSTE-ADMIN", observacion: str = "") -> dict:
    """
    delta positivo = entrada, negativo = salida.
    Registra automáticamente el movimiento en movimientos_inventario.
    """
    payload = {"delta": delta}
    if referencia:
        payload["referencia"] = referencia
    if observacion:
        payload["observacion"] = observacion
    return _handle(requests.post(
        _url(f"variantes-producto/{id_variante}/stock"),
        json=payload,
        headers=_headers(),
    ))


def eliminar_variante(id_: int) -> dict:
    return _handle(requests.delete(_url(f"variantes-producto/{id_}"), headers=_headers()))


def resumen_inventario() -> list:
    return _handle(requests.get(_url("admin/inventario/resumen"), headers=_headers()))


def stock_bajo() -> list:
    return _handle(requests.get(_url("admin/inventario/stock-bajo"), headers=_headers()))


# ─────────────────────────────────────────────
# PEDIDOS ADMIN
# ─────────────────────────────────────────────

def listar_pedidos(estado: str | None = None, limit: int = 50) -> list:
    params = {"limit": limit}
    if estado:
        params["estado"] = estado
    return _handle(requests.get(_url("admin/pedidos"), params=params, headers=_headers()))


def obtener_pedido(id_: int) -> dict:
    return _handle(requests.get(_url(f"admin/pedidos/{id_}"), headers=_headers()))


def cambiar_estado_pedido(id_: int, id_estado_pedido: int) -> dict:
    return _handle(requests.patch(
        _url(f"admin/pedidos/{id_}/estado"),
        json={"idEstadoPedido": id_estado_pedido},
        headers=_headers(),
    ))


# ─────────────────────────────────────────────
# USUARIOS ADMIN
# ─────────────────────────────────────────────

def listar_usuarios() -> list:
    return _handle(requests.get(_url("admin/usuarios"), headers=_headers()))


def toggle_estado_usuario(id_: int, estado: bool) -> dict:
    return _handle(requests.patch(
        _url(f"admin/usuarios/{id_}/estado"),
        json={"estado": estado},
        headers=_headers(),
    ))


# ─────────────────────────────────────────────
# ESTADO PEDIDO
# ─────────────────────────────────────────────

def listar_estados_pedido() -> list:
    return _handle(requests.get(_url("estado-pedido"), headers=_headers()))


def obtener_estado_pedido(id_: int) -> dict:
    return _handle(requests.get(_url(f"estado-pedido/{id_}"), headers=_headers()))


# ─────────────────────────────────────────────
# ESTADO ENVÍO
# ─────────────────────────────────────────────

def listar_estados_envio() -> list:
    return _handle(requests.get(_url("estado-envio"), headers=_headers()))


def obtener_estado_envio(id_: int) -> dict:
    return _handle(requests.get(_url(f"estado-envio/{id_}"), headers=_headers()))


# ─────────────────────────────────────────────
# ROLES
# ─────────────────────────────────────────────

def listar_roles() -> list:
    return _handle(requests.get(_url("roles"), headers=_headers()))


# ─────────────────────────────────────────────
# UTILIDADES GENÉRICAS
# (para tablas que usan BaseCrudController con SQL directo)
# ─────────────────────────────────────────────

def generic_list(table: str) -> list:
    """Lista registros de una tabla via endpoint genérico."""
    endpoint_map = {
        "categorias": listar_categorias,
        "productos": listar_productos,
        "colores": listar_colores,
        "medidas": listar_medidas,
        "variantes_producto": listar_variantes,
        "usuarios": listar_usuarios,
        "pedidos": listar_pedidos,
    }
    fn = endpoint_map.get(table)
    if fn:
        return fn()
    # Para tablas menores (colecciones, imágenes, etc.) usamos endpoint raw
    return _handle(requests.get(_url(f"admin/tabla/{table}"), headers=_headers())) or []


def generic_create(table: str, data: dict) -> dict:
    endpoint_map = {
        "categorias": crear_categoria,
        "productos": crear_producto,
        "colores": crear_color,
        "medidas": crear_medida,
        "variantes_producto": crear_variante,
    }
    fn = endpoint_map.get(table)
    if fn:
        return fn(data)
    return _handle(requests.post(_url(f"admin/tabla/{table}"), json=data, headers=_headers()))


def generic_update(table: str, pk: Any, data: dict) -> dict:
    endpoint_map = {
        "categorias": lambda d: actualizar_categoria(pk, d),
        "productos": lambda d: actualizar_producto(pk, d),
        "colores": lambda d: actualizar_color(pk, d),
        "medidas": lambda d: actualizar_medida(pk, d),
        "variantes_producto": lambda d: actualizar_variante(pk, d),
    }
    fn = endpoint_map.get(table)
    if fn:
        return fn(data)
    return _handle(requests.patch(_url(f"admin/tabla/{table}/{pk}"), json=data, headers=_headers()))


def generic_delete(table: str, pk: Any) -> dict:
    endpoint_map = {
        "categorias": lambda: eliminar_categoria(pk),
        "productos": lambda: eliminar_producto(pk),
        "colores": lambda: eliminar_color(pk),
        "medidas": lambda: eliminar_medida(pk),
        "variantes_producto": lambda: eliminar_variante(pk),
    }
    fn = endpoint_map.get(table)
    if fn:
        return fn()
    return _handle(requests.delete(_url(f"admin/tabla/{table}/{pk}"), headers=_headers()))


# ─────────────────────────────────────────────
# UPLOAD DE IMÁGENES
# ─────────────────────────────────────────────

def upload_imagen(file_path: str) -> str:
    """
    Sube un archivo de imagen a la API y retorna la URL pública.
    La URL se guarda en url_imagen de imagenes_producto.
    """
    import mimetypes
    from pathlib import Path

    path = Path(file_path)
    mime_type, _ = mimetypes.guess_type(str(path))
    mime_type = mime_type or "application/octet-stream"

    # Construir headers sin Content-Type para que requests lo ponga
    # automáticamente con el boundary de multipart
    headers = {}
    if _token:
        headers["Authorization"] = f"Bearer {_token}"

    with open(path, "rb") as f:
        response = requests.post(
            _url("admin/imagenes/upload"),
            headers=headers,
            files={"file": (path.name, f, mime_type)},
        )

    data = _handle(response)
    return data["url"]
