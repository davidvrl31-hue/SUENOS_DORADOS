from controllers.categorias_controller import CategoriasController
from views.crud_base_view import BaseCrudView
from views.productos_view import PRODUCTOS_DISPLAY_QUERIES


CATEGORIAS_GROUP = {
    "title": "Categorias",
    "tables": [
        {
            "label": "Categorias",
            "table": "categorias",
            "pk": "id_categoria",
            "fields": [
                ("nombre_categoria", "str"),
                ("descripcion_categoria", "str"),
                ("slug", "str"),
            ],
        }
    ],
}


class CategoriasView(BaseCrudView):
    def __init__(self):
        self.controller = CategoriasController()
        super().__init__(self.controller.group_id, CATEGORIAS_GROUP, PRODUCTOS_DISPLAY_QUERIES)


__all__ = ["CategoriasView"]
