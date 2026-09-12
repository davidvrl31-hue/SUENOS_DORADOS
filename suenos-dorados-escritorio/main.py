"""
Punto de entrada de la app de escritorio Sueños Dorados Admin.

Ya NO levanta una API FastAPI interna — toda la comunicación
va hacia la API NestJS (suenos-dorados-api) que corre en el puerto 3000.
"""
import flet as ft

import api_client
from controllers.autenticacion_controller import AuthController
from views.autenticacion_view import AuthView
from views.panel_view import DashboardView


async def main(page: ft.Page):
    page.title = "Sueños Dorados - Admin"
    page.theme_mode = ft.ThemeMode.LIGHT
    page.theme = ft.Theme(color_scheme_seed="#E7A21B", use_material3=True, font_family="Inter")
    page.dark_theme = ft.Theme(color_scheme_seed="#E7A21B", use_material3=True, font_family="Inter")
    page.padding = 0
    page.bgcolor = "#F2F4F7"

    page.window.title_bar_hidden = False
    page.window.width = 1280
    page.window.height = 800
    page.window.min_width = 1024
    page.window.min_height = 640
    await page.window.center()

    auth_ctrl = AuthController()

    def go_dashboard(usuario):
        page.clean()
        page.add(DashboardView(usuario, on_logout=go_login))
        page.update()

    def go_login():
        api_client.logout()
        page.clean()
        page.add(AuthView(auth_ctrl, on_login_success=go_dashboard))
        page.update()

    go_login()


if __name__ == "__main__":
    ft.run(main)
