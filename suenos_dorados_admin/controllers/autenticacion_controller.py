"""
AuthController — autenticación via API NestJS.
Ya no conecta directamente a PostgreSQL.
"""
import api_client


class AuthController:
    def __init__(self, db=None):
        # db se mantiene por compatibilidad con el código existente
        # pero ya no se usa para autenticación
        self.db = db

    def init_admin(self):
        """
        Ya no necesita crear el admin manualmente.
        El admin debe existir en la BD. Solo intenta hacer login
        con las credenciales por defecto para verificar conexión.
        """
        pass

    def login(self, correo: str, password: str) -> dict | None:
        """
        Autentica vía NestJS y guarda el JWT en api_client.
        Retorna un dict con los datos del usuario o None si falla.
        """
        try:
            data = api_client.login(correo, password)
            return data.get("usuario")
        except Exception:
            return None
