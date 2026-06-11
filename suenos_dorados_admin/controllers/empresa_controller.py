from config import APP_NAME, APP_SUBTITLE
from database import Base, SessionLocal, engine
from models.empresa_model import ConfiguracionEmpresa, EmpresaInfo


class EmpresaController:
    def __init__(self, session_factory=SessionLocal):
        self.session_factory = session_factory
        try:
            Base.metadata.create_all(bind=engine, tables=[ConfiguracionEmpresa.__table__])
        except Exception:
            pass

    def _defaults(self):
        return EmpresaInfo(nombre=APP_NAME, subtitulo=APP_SUBTITLE)

    def _to_info(self, row):
        if row is None:
            return self._defaults()
        defaults = self._defaults()
        return EmpresaInfo(
            nombre=row.nombre or defaults.nombre,
            subtitulo=row.subtitulo or defaults.subtitulo,
            nit=row.nit or defaults.nit,
            direccion=row.direccion or defaults.direccion,
            ciudad=row.ciudad or defaults.ciudad,
            contacto=row.email or defaults.contacto,
            telefono=row.telefono or defaults.telefono,
            actividad=row.actividad or defaults.actividad,
            logo_url=row.logo_url or defaults.logo_url,
        )

    def get_info(self):
        db = self.session_factory()
        try:
            row = db.query(ConfiguracionEmpresa).order_by(ConfiguracionEmpresa.id.asc()).first()
            if row is None:
                defaults = self._defaults()
                row = ConfiguracionEmpresa(
                    id=1,
                    nombre=defaults.nombre,
                    subtitulo=defaults.subtitulo,
                    nit=defaults.nit,
                    telefono=defaults.telefono,
                    direccion=defaults.direccion,
                    ciudad=defaults.ciudad,
                    email=defaults.contacto,
                    logo_url=defaults.logo_url,
                    actividad=defaults.actividad,
                )
                db.add(row)
                db.commit()
                db.refresh(row)
            return self._to_info(row)
        except Exception:
            db.rollback()
            return self._defaults()
        finally:
            db.close()

    def save_info(self, data):
        info = EmpresaInfo(**{
            field: str(data.get(field, "")).strip()
            for field in EmpresaInfo.__dataclass_fields__
        })
        db = self.session_factory()
        try:
            row = db.query(ConfiguracionEmpresa).order_by(ConfiguracionEmpresa.id.asc()).first()
            if row is None:
                row = ConfiguracionEmpresa(id=1)
                db.add(row)
            row.nombre = info.nombre
            row.subtitulo = info.subtitulo
            row.nit = info.nit
            row.telefono = info.telefono
            row.direccion = info.direccion
            row.ciudad = info.ciudad
            row.email = info.contacto
            row.logo_url = info.logo_url
            row.actividad = info.actividad
            db.commit()
            db.refresh(row)
            return self._to_info(row)
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()
