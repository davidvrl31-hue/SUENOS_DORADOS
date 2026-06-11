"""
InventoryController — usa la API NestJS para métricas de inventario.
"""
import api_client


class InventoryController:
    def __init__(self, db=None, low_stock_threshold: int = 3):
        self.db = db
        self.low_stock_threshold = low_stock_threshold

    def inventory_summary(self) -> dict:
        try:
            stats = api_client.dashboard_stats()
            return {
                "stock_total": stats.get("stockTotal", 0),
                "stock_bajo": stats.get("stockBajo", 0),
                "agotados": stats.get("agotados", 0),
                "valor_inventario": 0,
            }
        except Exception:
            return {"stock_total": 0, "stock_bajo": 0, "agotados": 0, "valor_inventario": 0}

    def low_stock_variants(self) -> list:
        try:
            rows = api_client.stock_bajo()
            # Convertir dicts a objetos con atributos para compatibilidad con el panel
            return [_DictObj(r) for r in rows]
        except Exception:
            return []

    def list_stock(self) -> list:
        try:
            rows = api_client.resumen_inventario()
            return [_DictObj(r) for r in rows]
        except Exception:
            return []

    def stock_status(self, variant) -> str:
        stock = variant.stock if hasattr(variant, "stock") else variant.get("stock", 0)
        if stock <= 0:
            return "Agotado"
        if stock <= self.low_stock_threshold:
            return "Stock bajo"
        return "Normal"


class _DictObj:
    """Envuelve un dict para que sea accesible con atributos (obj.sku)."""
    def __init__(self, data: dict):
        self._data = data
        for key, value in data.items():
            setattr(self, key, value)
        # Compatibilidad con código que accede a .producto.nombre_producto
        if "nombre_producto" in data and not hasattr(self, "producto"):
            self.producto = _DictObj({"nombre_producto": data["nombre_producto"]})

    def get(self, key, default=None):
        return self._data.get(key, default)
