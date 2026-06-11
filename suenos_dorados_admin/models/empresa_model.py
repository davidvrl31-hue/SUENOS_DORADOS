from dataclasses import dataclass

from sqlalchemy import Column, Integer, String, Text

from database import Base


@dataclass
class EmpresaInfo:
    nombre: str = "Sueños Dorados"
    subtitulo: str = "Gestión Administrativa"
    nit: str = "900.000.000-1"
    direccion: str = "Calle 10 # 25-40"
    ciudad: str = "Cali"
    contacto: str = "contacto@suenosdorados.com"
    telefono: str = "300 000 0000"
    actividad: str = "E-commerce textil"
    logo_url: str = ""

    @property
    def header_line(self):
        parts = [f"NIT {self.nit}", self.direccion, self.actividad]
        return " | ".join(part for part in parts if part)


class ConfiguracionEmpresa(Base):
    __tablename__ = "configuracion_empresa"

    id = Column(Integer, primary_key=True)
    nombre = Column(String(150), nullable=False)
    subtitulo = Column(String(150), nullable=False, default="Gestión Administrativa")
    nit = Column(String(40), nullable=False)
    telefono = Column(String(30))
    direccion = Column(String(200))
    ciudad = Column(String(100))
    email = Column(String(120))
    logo_url = Column(String(500))
    actividad = Column(Text)
