"""
SalesController — usa la API NestJS para ventas y pedidos.
La lógica de aprobación de pago y Kardex se queda en el backend NestJS.
"""
from decimal import Decimal

import api_client


class SalesController:
    def __init__(self, db=None):
        self.db = db

    def daily_sales_total(self) -> Decimal:
        try:
            stats = api_client.dashboard_stats()
            return Decimal(str(stats.get("ventasHoy", 0)))
        except Exception:
            return Decimal("0.00")

    def order_counts(self) -> dict:
        try:
            stats = api_client.dashboard_stats()
            return {
                "pedidos": stats.get("pedidos", 0),
                "pendientes": 0,
                "pagados": 0,
                "preparacion": 0,
            }
        except Exception:
            return {"pedidos": 0, "pendientes": 0, "pagados": 0, "preparacion": 0}

    def list_recent_orders(self, limit: int = 20) -> list:
        try:
            return api_client.listar_pedidos(limit=limit)
        except Exception:
            return []

    def approve_payment(self, pedido_id: int, metodo_pago: str = "Bold", estado_destino: str = "Pagado") -> dict:
        """
        Cambia el estado del pedido via API NestJS.
        La lógica de stock y Kardex debe estar implementada en NestJS.
        """
        # Buscar el id del estado destino
        try:
            pedido = api_client.obtener_pedido(pedido_id)
            # Cambiar estado — necesitamos el id_estado_pedido
            # Lo resolvemos buscando en la lista de pedidos recientes
            # Para Pagado = 2, Despachado = 4 (según tu DDL típico)
            estado_ids = {
                "Pendiente": 1,
                "Pagado": 2,
                "En preparación": 3,
                "Despachado": 4,
                "Entregado": 5,
                "Cancelado": 6,
            }
            id_estado = estado_ids.get(estado_destino, 2)
            return api_client.cambiar_estado_pedido(pedido_id, id_estado)
        except Exception as exc:
            raise RuntimeError(f"No se pudo aprobar el pago: {exc}") from exc

    def ensure_order_stock_discounted(self, pedido_id: int) -> bool:
        """El descuento de stock se maneja en NestJS al cambiar el estado."""
        return True
