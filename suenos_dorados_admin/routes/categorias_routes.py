from fastapi import APIRouter

from api.crud import register_crud_routes
from models.catalogo_model import Categoria


router = APIRouter(prefix="/api/admin/categories", tags=["categories"])

register_crud_routes(router, "", Categoria, "id_categoria")
