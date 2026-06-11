"""
BaseCrudController — ahora delega todas las operaciones
de escritura/lectura a la API NestJS via api_client.py.
Ya no usa SQLAlchemy directamente para el CRUD de tablas.
"""
import api_client
from utils.security import hash_password
from utils.theme import Tema


class BaseCrudController:
    """Lógica común de CRUD usada por las vistas administrativas."""

    group_id = None

    def save_record(self, view, dialog=None):
        config = view.current_config
        try:
            view._clear_dialog_error()
            values = {}
            for field, field_type in config["fields"]:
                try:
                    raw_value = view._field_value(field)
                    values[field] = view._parse_value(raw_value, field_type)
                except Exception:
                    raise ValueError(f"El campo {view._pretty(field)} debe tener un formato válido")
            view._validate_record(config, values)

            # Hashear contraseña si es tabla de usuarios
            if config["table"] == "usuarios":
                raw_password = values.get("contrasena_hash")
                if raw_password:
                    password_text = str(raw_password)
                    if not password_text.startswith(("$2a$", "$2b$", "$2y$")):
                        values["contrasena_hash"] = hash_password(password_text)
                elif view.selected_record_id is not None:
                    values.pop("contrasena_hash", None)

            is_new = view.selected_record_id is None

            # Convertir snake_case → camelCase para la API NestJS
            camel_values = _to_camel(values)

            if is_new:
                api_client.generic_create(config["table"], camel_values)
            else:
                api_client.generic_update(config["table"], view.selected_record_id, camel_values)

            # Guardar dirección si es usuario
            if config["table"] == "usuarios":
                # La dirección se guarda directo a BD porque la API NestJS
                # ya tiene su propio endpoint de direcciones
                view._save_user_address_api(view.selected_record_id)

            view._clear_form()
            view._build_crud_content()
            if dialog is not None:
                view._close_dialog(dialog)
            action = "creado" if is_new else "actualizado"
            view._snack(f"{config['label']} {action} correctamente", Tema.SUCCESS)

        except Exception as exc:
            if dialog is not None:
                view._show_dialog_error(f"No se pudo guardar {config['label']}: {exc}")
            else:
                view._snack(f"No se pudo guardar {config['label']}: {exc}", Tema.ERROR)

    def delete_record(self, view, record=None, dialog=None):
        record_id = record.get(view.current_config["pk"]) if record else view.selected_record_id
        if record_id is None:
            view._snack("Selecciona un registro primero", Tema.WARNING)
            return
        label = view.current_config["label"]
        try:
            api_client.generic_delete(view.current_config["table"], record_id)
            if dialog is not None:
                view._close_dialog(dialog)
            view.selected_record_id = None
            view.selected_record_text.value = "Registro seleccionado: ninguno"
            view._build_crud_content()
            view._snack(f"{label} eliminado correctamente", Tema.SUCCESS)
        except Exception as exc:
            view._snack(
                f"No se pudo eliminar {label}. Puede tener registros relacionados: {exc}",
                Tema.ERROR,
            )

    def set_boolean(self, view, value):
        if view.selected_record_id is None:
            view._snack("Selecciona un registro primero", Tema.WARNING)
            return
        bool_fields = [name for name, kind in view.current_config["fields"] if kind == "bool"]
        if not bool_fields:
            view._snack("Esta tabla no tiene campo de habilitación", Tema.WARNING)
            return
        estado = "activado" if value else "desactivado"
        self.update_selected(view, {bool_fields[-1]: value}, f"{view.current_config['label']} {estado} correctamente")

    def update_selected(self, view, values, message):
        camel_values = _to_camel(values)
        try:
            api_client.generic_update(
                view.current_config["table"],
                view.selected_record_id,
                camel_values,
            )
            view._build_crud_content()
            view._snack(message, Tema.SUCCESS)
        except Exception as exc:
            view._snack(f"No se pudo actualizar: {exc}", Tema.ERROR)

    def toggle_discount_active(self, view, discount_id, is_active):
        try:
            api_client.generic_update("descuentos", discount_id, {"isActive": is_active})
            view._build_crud_content()
            estado = "activado" if is_active else "desactivado"
            view._snack(f"Descuento {estado} correctamente", Tema.SUCCESS)
        except Exception as exc:
            view._snack(f"No se pudo cambiar el estado del descuento: {exc}", Tema.ERROR)


# ──────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────

def _snake_to_camel(name: str) -> str:
    """Convierte snake_case a camelCase."""
    parts = name.split("_")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


def _to_camel(data: dict) -> dict:
    """Convierte todas las claves de un dict de snake_case a camelCase."""
    return {_snake_to_camel(k): v for k, v in data.items()}
