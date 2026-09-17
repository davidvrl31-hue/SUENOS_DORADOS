"""Tema visual de Sueños Dorados Admin — modo claro."""

from config import (
    COLOR_ALERTA,
    COLOR_BLANCO,
    COLOR_BORDE,
    COLOR_EXITO,
    COLOR_FONDO,
    COLOR_INFO,
    COLOR_PRIMARIO,
    COLOR_PRIMARIO_HOVER,
    COLOR_SECUNDARIO,
    COLOR_SIDEBAR,
    COLOR_SIDEBAR_ACTIVE_BG,
    COLOR_SIDEBAR_BORDER,
    COLOR_SIDEBAR_HOVER,
    COLOR_SIDEBAR_TEXT,
    COLOR_SIDEBAR_TEXT_MUTED,
    COLOR_TEXTO,
    COLOR_TEXTO_G,
)


class Tema:
    GOLD = COLOR_PRIMARIO
    GOLD_LIGHT = "#F8D37B"
    GOLD_DARK = COLOR_PRIMARIO_HOVER
    GOLD_SOFT = "#FFF4D8"

    # ── Fondos generales ──────────────────────────────────────────────────────
    BG_PRIMARY = COLOR_FONDO
    BG_SECONDARY = "#F7F9FD"
    BG_CARD = COLOR_BLANCO
    BG_INPUT = "#FFFFFF"
    BG_TABLE_HEAD = "#F3F6FB"
    BG_PANEL = "#EEF3FB"

    # ── Sidebar claro ────────────────────────────────────────────────────────
    BG_SIDEBAR = COLOR_SIDEBAR                  # blanco
    BG_SIDEBAR_HOVER = COLOR_SIDEBAR_HOVER      # gris muy suave
    BG_SIDEBAR_ACTIVE = COLOR_SIDEBAR_ACTIVE_BG # amarillo suave (igual que web)
    SIDEBAR_BORDER = COLOR_SIDEBAR_BORDER       # borde gris claro
    BG_HOVER = COLOR_PRIMARIO

    # ── Textos ───────────────────────────────────────────────────────────────
    TEXT_PRIMARY = COLOR_TEXTO
    TEXT_SECONDARY = COLOR_SECUNDARIO
    TEXT_MUTED = COLOR_TEXTO_G
    TEXT_ON_DARK = COLOR_BLANCO
    TEXT_ON_GOLD = "#172033"
    # En sidebar claro los textos son oscuros
    TEXT_SIDEBAR = COLOR_SIDEBAR_TEXT
    TEXT_SIDEBAR_MUTED = COLOR_SIDEBAR_TEXT_MUTED

    # ── Bordes ───────────────────────────────────────────────────────────────
    BORDER = COLOR_BORDE
    BORDER_SOFT = "#E4E9F2"
    BORDER_FOCUS = COLOR_PRIMARIO

    # ── Semáforo ─────────────────────────────────────────────────────────────
    SUCCESS = COLOR_EXITO
    WARNING = COLOR_PRIMARIO
    ERROR = COLOR_ALERTA
    INFO = COLOR_INFO

    # ── Layout ───────────────────────────────────────────────────────────────
    SIDEBAR_WIDTH = 270
    SIDEBAR_COLLAPSED = 72

    RADIUS_SM = 8
    RADIUS_MD = 10
    RADIUS_LG = 12
    RADIUS_XL = 18
