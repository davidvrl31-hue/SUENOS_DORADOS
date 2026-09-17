"""
EnvioView — Gestión de guías de envío (solo panel de escritorio).

El administrador selecciona un pedido de la lista y registra
manualmente el número de guía y la transportadora. Control interno.
No se muestra en web ni en móvil.
"""
import flet as ft
import api_client
from utils.theme import Tema


# Transportadoras comunes en Colombia
TRANSPORTADORAS = [
    "Servientrega",
    "Coordinadora",
    "Deprisa",
    "Envia",
    "TCC",
    "Interrapidísimo",
    "4-72",
    "Domina",
    "Otra",
]


class EnvioView(ft.Container):
    def __init__(self):
        super().__init__()
        self.expand = True
        self.bgcolor = Tema.BG_PRIMARY
        self.padding = 0

        self._pedidos: list[dict] = []
        self._pedido_sel: dict | None = None
        self._envio_actual: dict | None = None

        # ── Campos del formulario ──────────────────────────────────────────
        self._guia_field = ft.TextField(
            label="Número de guía",
            hint_text="Ej: SRV-20241234",
            prefix_icon=ft.Icons.QR_CODE_ROUNDED,
            border_color=Tema.BORDER,
            focused_border_color=Tema.GOLD,
            bgcolor=Tema.BG_INPUT,
            label_style=ft.TextStyle(color=Tema.TEXT_MUTED, size=13),
            text_style=ft.TextStyle(color=Tema.TEXT_PRIMARY, size=14),
            cursor_color=Tema.GOLD,
            border_radius=10,
            expand=True,
        )
        self._transportadora_field = ft.TextField(
            label="Transportadora",
            hint_text="Ej: Servientrega",
            prefix_icon=ft.Icons.LOCAL_SHIPPING_ROUNDED,
            border_color=Tema.BORDER,
            focused_border_color=Tema.GOLD,
            bgcolor=Tema.BG_INPUT,
            label_style=ft.TextStyle(color=Tema.TEXT_MUTED, size=13),
            text_style=ft.TextStyle(color=Tema.TEXT_PRIMARY, size=14),
            cursor_color=Tema.GOLD,
            border_radius=10,
            expand=True,
        )
        self._feedback = ft.Text("", size=13, visible=False)
        self._save_btn = ft.FilledButton(
            content=ft.Row(
                alignment=ft.MainAxisAlignment.CENTER,
                controls=[
                    ft.Icon(ft.Icons.SAVE_ROUNDED, color=ft.Colors.WHITE, size=18),
                    ft.Text("Guardar guía", color=ft.Colors.WHITE, weight=ft.FontWeight.W_700),
                ],
            ),
            style=ft.ButtonStyle(
                bgcolor={
                    ft.ControlState.DEFAULT: Tema.GOLD,
                    ft.ControlState.HOVERED: Tema.GOLD_DARK,
                    ft.ControlState.DISABLED: Tema.BORDER,
                },
                shape=ft.RoundedRectangleBorder(radius=10),
            ),
            disabled=True,
            on_click=self._guardar,
        )

        # ── Panel derecho ──────────────────────────────────────────────────
        self._form_panel = ft.Container(
            expand=True,
            bgcolor=Tema.BG_CARD,
            border_radius=14,
            padding=24,
            border=ft.Border(
                left=ft.BorderSide(1, Tema.BORDER_SOFT),
                right=ft.BorderSide(1, Tema.BORDER_SOFT),
                top=ft.BorderSide(1, Tema.BORDER_SOFT),
                bottom=ft.BorderSide(1, Tema.BORDER_SOFT),
            ),
            content=self._empty_form_content(),
        )

        # ── Tabla ──────────────────────────────────────────────────────────
        self._table = ft.DataTable(
            border_radius=10,
            bgcolor=Tema.BG_CARD,
            heading_row_color=ft.Colors.with_opacity(1.0, Tema.BG_TABLE_HEAD),
            heading_row_height=44,
            data_row_min_height=48,
            data_row_max_height=56,
            divider_thickness=1,
            show_bottom_border=True,
            column_spacing=18,
            columns=[
                ft.DataColumn(ft.Text("Pedido",         weight=ft.FontWeight.W_700, color=Tema.TEXT_PRIMARY, size=12)),
                ft.DataColumn(ft.Text("Cliente",        weight=ft.FontWeight.W_700, color=Tema.TEXT_PRIMARY, size=12)),
                ft.DataColumn(ft.Text("Estado pedido",  weight=ft.FontWeight.W_700, color=Tema.TEXT_PRIMARY, size=12)),
                ft.DataColumn(ft.Text("Guía registrada",weight=ft.FontWeight.W_700, color=Tema.TEXT_PRIMARY, size=12)),
                ft.DataColumn(ft.Text("Transportadora", weight=ft.FontWeight.W_700, color=Tema.TEXT_PRIMARY, size=12)),
                ft.DataColumn(ft.Text("Acción",         weight=ft.FontWeight.W_700, color=Tema.TEXT_PRIMARY, size=12)),
            ],
            rows=[],
        )
        self._error_text = ft.Text("", color=Tema.ERROR, size=13, visible=False)
        self._table_container = ft.Container(
            expand=True,
            content=ft.Column(expand=True, scroll=ft.ScrollMode.AUTO, controls=[]),
        )

        # ── Layout ─────────────────────────────────────────────────────────
        self.content = ft.Column(
            expand=True,
            spacing=0,
            controls=[
                self._build_header(),
                ft.Container(
                    expand=True,
                    padding=ft.Padding(24, 16, 24, 24),
                    content=ft.Row(
                        expand=True,
                        spacing=20,
                        vertical_alignment=ft.CrossAxisAlignment.START,
                        controls=[
                            ft.Container(
                                expand=2,
                                content=ft.Column(
                                    expand=True,
                                    spacing=12,
                                    controls=[
                                        ft.Row(
                                            alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
                                            vertical_alignment=ft.CrossAxisAlignment.CENTER,
                                            controls=[
                                                ft.Text("Pedidos", size=15, weight=ft.FontWeight.W_700, color=Tema.TEXT_PRIMARY),
                                                ft.IconButton(
                                                    icon=ft.Icons.REFRESH_ROUNDED,
                                                    icon_color=Tema.GOLD,
                                                    tooltip="Actualizar",
                                                    on_click=lambda _: self._cargar(),
                                                ),
                                            ],
                                        ),
                                        self._error_text,
                                        ft.Container(
                                            expand=True,
                                            bgcolor=Tema.BG_CARD,
                                            border_radius=14,
                                            border=ft.Border(
                                                left=ft.BorderSide(1, Tema.BORDER_SOFT),
                                                right=ft.BorderSide(1, Tema.BORDER_SOFT),
                                                top=ft.BorderSide(1, Tema.BORDER_SOFT),
                                                bottom=ft.BorderSide(1, Tema.BORDER_SOFT),
                                            ),
                                            shadow=ft.BoxShadow(blur_radius=14, color=ft.Colors.with_opacity(0.06, ft.Colors.BLACK), offset=ft.Offset(0, 4)),
                                            padding=0,
                                            content=ft.Column(
                                                expand=True,
                                                scroll=ft.ScrollMode.AUTO,
                                                controls=[self._table_container],
                                            ),
                                        ),
                                    ],
                                ),
                            ),
                            ft.Container(
                                expand=1,
                                content=ft.Column(
                                    spacing=12,
                                    controls=[
                                        ft.Text("Registrar guía", size=15, weight=ft.FontWeight.W_700, color=Tema.TEXT_PRIMARY),
                                        self._form_panel,
                                    ],
                                ),
                            ),
                        ],
                    ),
                ),
            ],
        )

        self._cargar()

    # ── Header ─────────────────────────────────────────────────────────────

    def _build_header(self):
        return ft.Container(
            bgcolor=Tema.GOLD_SOFT,
            padding=ft.Padding(24, 18, 24, 18),
            border=ft.Border(bottom=ft.BorderSide(1, Tema.BORDER_SOFT)),
            content=ft.Row(
                alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
                vertical_alignment=ft.CrossAxisAlignment.CENTER,
                controls=[
                    ft.Row(spacing=14, controls=[
                        ft.Container(
                            width=44, height=44, border_radius=12,
                            bgcolor=Tema.GOLD,
                            alignment=ft.Alignment.CENTER,
                            content=ft.Icon(ft.Icons.LOCAL_SHIPPING_ROUNDED, color=ft.Colors.WHITE, size=22),
                        ),
                        ft.Column(spacing=2, controls=[
                            ft.Text("Guías de envío", size=20, weight=ft.FontWeight.W_800, color=Tema.TEXT_PRIMARY),
                            ft.Text("Registro manual de número de guía y transportadora — solo control interno.", size=12, color=Tema.TEXT_MUTED),
                        ]),
                    ]),
                ],
            ),
        )

    def _empty_form_content(self):
        return ft.Column(
            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
            alignment=ft.MainAxisAlignment.CENTER,
            spacing=12,
            controls=[
                ft.Container(height=16),
                ft.Icon(ft.Icons.TOUCH_APP_ROUNDED, size=42, color=Tema.BORDER),
                ft.Text("Selecciona un pedido", size=14, color=Tema.TEXT_MUTED, text_align=ft.TextAlign.CENTER),
                ft.Text("Haz clic en 'Registrar guía' para asignar\nla guía y transportadora.", size=12, color=Tema.BORDER, text_align=ft.TextAlign.CENTER),
            ],
        )

    # ── Carga ──────────────────────────────────────────────────────────────

    def _cargar(self):
        self._table_container.content = ft.Column(
            expand=True,
            scroll=ft.ScrollMode.AUTO,
            controls=[
                ft.Container(
                    padding=24,
                    content=ft.Row(
                        alignment=ft.MainAxisAlignment.CENTER,
                        controls=[
                            ft.ProgressRing(width=22, height=22, color=Tema.GOLD),
                            ft.Text("  Cargando pedidos...", color=Tema.TEXT_MUTED, size=13),
                        ],
                    ),
                )
            ],
        )
        self._error_text.visible = False
        try:
            self.update()
        except RuntimeError:
            pass

        try:
            pedidos = api_client.listar_pedidos(limit=100)
            self._pedidos = pedidos or []

            for p in self._pedidos:
                id_pedido = p.get("idPedido") or p.get("id_pedido")
                envio = api_client.get_envio_por_pedido(id_pedido)
                if envio:
                    p["numeroGuia"]    = envio.get("numeroGuia") or envio.get("numero_guia") or ""
                    p["transportadora"] = envio.get("transportadora") or ""
                else:
                    p["numeroGuia"]    = ""
                    p["transportadora"] = ""

            self._build_table()
        except Exception as exc:
            self._error_text.value = f"Error al cargar pedidos: {exc}"
            self._error_text.visible = True
            self._table_container.content = ft.Container(
                padding=24,
                content=ft.Text("No se pudieron cargar los pedidos.", color=Tema.TEXT_MUTED, size=13),
            )

        try:
            self.update()
        except RuntimeError:
            pass

    # ── Tabla ──────────────────────────────────────────────────────────────

    def _build_table(self):
        rows = []
        for p in self._pedidos:
            id_pedido  = p.get("idPedido") or p.get("id_pedido", "—")
            cliente    = p.get("nombreUsuario") or p.get("nombre_usuario") or "—"
            apellido   = p.get("apellidoUsuario") or p.get("apellido_usuario") or ""
            estado     = p.get("descripcionEstado") or p.get("descripcion_estado") or "—"
            guia       = p.get("numeroGuia") or ""
            transport  = p.get("transportadora") or ""
            tiene_guia = bool(guia)

            rows.append(ft.DataRow(
                color=ft.Colors.with_opacity(0.04, Tema.GOLD) if tiene_guia else None,
                cells=[
                    ft.DataCell(ft.Text(f"#{id_pedido}", size=13, weight=ft.FontWeight.W_700, color=Tema.TEXT_PRIMARY)),
                    ft.DataCell(ft.Text(f"{cliente} {apellido}".strip(), size=13, color=Tema.TEXT_PRIMARY, max_lines=1)),
                    ft.DataCell(self._estado_badge(estado)),
                    ft.DataCell(
                        ft.Row(spacing=6, controls=[
                            ft.Icon(
                                ft.Icons.CHECK_CIRCLE_ROUNDED if tiene_guia else ft.Icons.RADIO_BUTTON_UNCHECKED_ROUNDED,
                                size=14,
                                color=Tema.SUCCESS if tiene_guia else Tema.BORDER,
                            ),
                            ft.Text(
                                guia if tiene_guia else "Sin guía",
                                size=12,
                                color=Tema.TEXT_PRIMARY if tiene_guia else Tema.TEXT_MUTED,
                                weight=ft.FontWeight.W_600 if tiene_guia else ft.FontWeight.W_400,
                            ),
                        ])
                    ),
                    ft.DataCell(ft.Text(transport if transport else "—", size=12, color=Tema.TEXT_PRIMARY if transport else Tema.TEXT_MUTED)),
                    ft.DataCell(
                        ft.TextButton(
                            content=ft.Row(spacing=4, controls=[
                                ft.Icon(ft.Icons.EDIT_ROUNDED, size=14, color=Tema.GOLD),
                                ft.Text("Registrar guía", size=12, color=Tema.GOLD, weight=ft.FontWeight.W_600),
                            ]),
                            on_click=lambda _, ped=p: self._seleccionar(ped),
                        )
                    ),
                ],
            ))

        self._table.rows = rows
        if not rows:
            self._table_container.content = ft.Container(
                padding=24,
                content=ft.Text("No hay pedidos registrados.", color=Tema.TEXT_MUTED, size=13),
            )
        else:
            self._table_container.content = ft.Column(
                expand=True,
                scroll=ft.ScrollMode.AUTO,
                controls=[
                    ft.Container(
                        content=ft.Row(scroll=ft.ScrollMode.AUTO, controls=[self._table]),
                    )
                ],
            )

    # ── Selección ──────────────────────────────────────────────────────────

    def _seleccionar(self, pedido: dict):
        self._pedido_sel  = pedido
        id_pedido = pedido.get("idPedido") or pedido.get("id_pedido")
        self._envio_actual = api_client.get_envio_por_pedido(id_pedido)

        guia_existente      = ""
        transport_existente = ""
        if self._envio_actual:
            guia_existente      = self._envio_actual.get("numeroGuia") or self._envio_actual.get("numero_guia") or ""
            transport_existente = self._envio_actual.get("transportadora") or ""

        self._guia_field.value           = guia_existente
        self._transportadora_field.value = transport_existente
        self._feedback.visible           = False
        self._save_btn.disabled          = False

        cliente  = pedido.get("nombreUsuario") or pedido.get("nombre_usuario") or "—"
        apellido = pedido.get("apellidoUsuario") or pedido.get("apellido_usuario") or ""
        estado   = pedido.get("descripcionEstado") or pedido.get("descripcion_estado") or "—"
        ya_tiene = bool(guia_existente)

        chips = ft.Row(
            wrap=True,
            spacing=6,
            run_spacing=6,
            controls=[
                ft.Container(
                    bgcolor=Tema.BG_SECONDARY,
                    border_radius=20,
                    padding=ft.Padding(10, 4, 10, 4),
                    border=ft.Border(
                        left=ft.BorderSide(1, Tema.BORDER),
                        right=ft.BorderSide(1, Tema.BORDER),
                        top=ft.BorderSide(1, Tema.BORDER),
                        bottom=ft.BorderSide(1, Tema.BORDER),
                    ),
                    ink=True,
                    on_click=lambda _, nombre=t: self._set_transportadora(nombre),
                    content=ft.Text(t, size=11, color=Tema.TEXT_SECONDARY),
                )
                for t in TRANSPORTADORAS
            ],
        )

        self._form_panel.content = ft.Column(
            spacing=16,
            controls=[
                ft.Container(
                    bgcolor=Tema.BG_SECONDARY,
                    border_radius=10,
                    padding=ft.Padding(14, 12, 14, 12),
                    border=ft.Border(
                        left=ft.BorderSide(3, Tema.GOLD),
                        right=ft.BorderSide(1, Tema.BORDER_SOFT),
                        top=ft.BorderSide(1, Tema.BORDER_SOFT),
                        bottom=ft.BorderSide(1, Tema.BORDER_SOFT),
                    ),
                    content=ft.Column(spacing=4, controls=[
                        ft.Text(f"Pedido #{id_pedido}", size=14, weight=ft.FontWeight.W_800, color=Tema.TEXT_PRIMARY),
                        ft.Text(f"Cliente: {cliente} {apellido}".strip(), size=12, color=Tema.TEXT_SECONDARY),
                        ft.Text(f"Estado: {estado}", size=12, color=Tema.TEXT_MUTED),
                        ft.Text(
                            "✓ Ya tiene guía registrada" if ya_tiene else "Sin guía registrada",
                            size=11,
                            color=Tema.SUCCESS if ya_tiene else Tema.TEXT_MUTED,
                            weight=ft.FontWeight.W_600,
                        ),
                    ]),
                ),
                self._guia_field,
                ft.Column(spacing=8, controls=[
                    self._transportadora_field,
                    ft.Text("Selección rápida:", size=11, color=Tema.TEXT_MUTED),
                    chips,
                ]),
                self._feedback,
                self._save_btn,
            ],
        )

        try:
            self.update()
        except RuntimeError:
            pass

    def _set_transportadora(self, nombre: str):
        self._transportadora_field.value = nombre
        try:
            self._transportadora_field.update()
        except RuntimeError:
            pass

    # ── Guardar ────────────────────────────────────────────────────────────

    def _guardar(self, _):
        if not self._pedido_sel:
            return

        guia      = (self._guia_field.value or "").strip()
        transport = (self._transportadora_field.value or "").strip()

        if not guia:
            self._feedback.value   = "⚠ El número de guía es obligatorio."
            self._feedback.color   = Tema.ERROR
            self._feedback.visible = True
            try: self.update()
            except RuntimeError: pass
            return
        if not transport:
            self._feedback.value   = "⚠ La transportadora es obligatoria."
            self._feedback.color   = Tema.ERROR
            self._feedback.visible = True
            try: self.update()
            except RuntimeError: pass
            return

        self._save_btn.disabled = True
        self._feedback.value   = "Guardando..."
        self._feedback.color   = Tema.TEXT_MUTED
        self._feedback.visible = True
        try: self.update()
        except RuntimeError: pass

        id_pedido = self._pedido_sel.get("idPedido") or self._pedido_sel.get("id_pedido")
        try:
            api_client.guardar_guia(id_pedido, guia, transport)
            self._feedback.value = f"✓ Guía guardada correctamente para el pedido #{id_pedido}."
            self._feedback.color = Tema.SUCCESS
            self._cargar()
        except Exception as exc:
            self._feedback.value = f"Error al guardar: {exc}"
            self._feedback.color = Tema.ERROR

        self._save_btn.disabled = False
        self._feedback.visible  = True
        try: self.update()
        except RuntimeError: pass

    # ── Badge de estado ────────────────────────────────────────────────────

    def _estado_badge(self, estado: str):
        colores = {
            "pendiente":      Tema.WARNING,
            "pagado":         Tema.INFO,
            "en preparación": Tema.INFO,
            "en preparacion": Tema.INFO,
            "despachado":     Tema.GOLD,
            "en camino":      Tema.GOLD,
            "entregado":      Tema.SUCCESS,
            "cancelado":      Tema.ERROR,
        }
        color = colores.get(estado.lower(), Tema.BORDER)
        return ft.Container(
            bgcolor=ft.Colors.with_opacity(0.12, color),
            border_radius=6,
            padding=ft.Padding(8, 3, 8, 3),
            border=ft.Border(
                left=ft.BorderSide(2, color),
                right=ft.BorderSide(1, ft.Colors.with_opacity(0.2, color)),
                top=ft.BorderSide(1, ft.Colors.with_opacity(0.2, color)),
                bottom=ft.BorderSide(1, ft.Colors.with_opacity(0.2, color)),
            ),
            content=ft.Text(estado, size=11, color=color, weight=ft.FontWeight.W_600),
        )
