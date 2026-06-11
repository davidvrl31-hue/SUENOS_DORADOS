"""
CatalogController — usa la API NestJS para todas las operaciones.
"""
import api_client


class CatalogController:
    def __init__(self, db=None):
        # db se mantiene por compatibilidad pero ya no se usa
        self.db = db

    def list_products(self):
        return api_client.listar_productos()

    def list_categories(self):
        return api_client.listar_categorias()

    def list_collections(self):
        # Las colecciones no tienen endpoint propio aún, devolvemos lista vacía
        # si el endpoint genérico no está disponible
        try:
            return api_client.generic_list("colecciones")
        except Exception:
            return []

    def dashboard_counts(self) -> dict:
        try:
            stats = api_client.dashboard_stats()
            return {
                "productos": stats.get("productos", 0),
                "categorias": stats.get("categorias", 0),
                "colecciones": 0,
                "variantes": stats.get("variantes", 0),
            }
        except Exception:
            return {"productos": 0, "categorias": 0, "colecciones": 0, "variantes": 0}
