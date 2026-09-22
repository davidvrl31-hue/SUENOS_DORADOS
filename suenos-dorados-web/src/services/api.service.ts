const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Categoria {
  idCategoria: number;
  nombreCategoria: string;
  descripcionCategoria: string | null;
  slug: string;
}

export interface Producto {
  idProducto: number;
  idCategoria: number;
  idColeccion: number | null;
  nombreProducto: string;
  descripcionProducto: string | null;
  slug: string;
  estadoProducto: boolean;
  fechaCreacion: string;
  imagenUrl?: string | null;
}

export interface VarianteProducto {
  idVariante: number;
  idProducto: number;
  idMedida: number;
  idColor: number;
  sku: string;
  precio: number;
  referencia: string;
  stock: number;
  estado: boolean;
}

export interface Medida {
  idMedida: number;
  nombreMedida: string;
  anchoCm: number | null;
  largoCm: number | null;
  descripcion: string | null;
}

export interface Color {
  idColor: number;
  nombreColor: string;
  codigoHex: string | null;
}

export interface LoginPayload {
  correoElectronico: string;
  contrasena: string;
}

export interface DireccionRegistroPayload {
  pais?: string;
  descripcionDepartamento: string;
  descripcionMunicipio: string;
  descripcionDireccion: string;
  complemento?: string;
  descripcionBarrio?: string;
  codigoPostal?: string;
  indicaciones?: string;
  etiqueta?: string;
  telefonoContacto?: string;
  esPrincipal?: boolean;
}

export interface RegistroPayload {
  nombreUsuario: string;
  apellidoUsuario: string;
  correoElectronico: string;
  contrasena: string;
  telefono?: string;
  /** Dirección inicial opcional — se guarda como principal al registrarse */
  direccion?: DireccionRegistroPayload;
}

export interface AuthResponse {
  access_token: string;
  usuario: {
    idUsuario: number;
    nombreUsuario: string;
    apellidoUsuario: string;
    correoElectronico: string;
    telefono: string | null;
    idRol: number;
  };
}

export interface DireccionAPI {
  idDireccion: number;
  idUsuario?: number;
  // Destinatario
  nombreDestinatario: string | null;
  telefonoContacto: string | null;
  documentoIdentidad: string | null;
  // Ubicación
  pais: string;
  descripcionDepartamento: string;
  descripcionMunicipio: string;
  // Dirección física
  descripcionDireccion: string;
  complemento: string | null;
  descripcionBarrio: string | null;
  codigoPostal: string | null;
  indicaciones: string | null;
  // Preferencias
  etiqueta: string;
  esPrincipal: boolean;
}

export interface CreateDireccionPayload {
  nombreDestinatario?: string;
  telefonoContacto?: string;
  documentoIdentidad?: string;
  pais?: string;
  descripcionDepartamento: string;
  descripcionMunicipio: string;
  descripcionDireccion: string;
  complemento?: string;
  descripcionBarrio?: string;
  codigoPostal?: string;
  indicaciones?: string;
  etiqueta?: string;
  esPrincipal?: boolean;
}

export interface ItemPedidoDetalle {
  idDetallePedido: number;
  idVariante: number;
  cantidad: number;
  precioUnitario: number;
  subtotalItem: number;
  sku: string;
  referencia: string;
  color: string | null;
  codigoHexColor: string | null;
  medida: string | null;
  nombreProducto: string | null;
  imagenProducto: string | null;
  slugProducto: string | null;
}

export interface PedidoDetalle {
  idPedido: number;
  idDireccion: number;
  idEstadoPedido: number;
  fechaPedido: string;
  subtotal: number;
  descuento: number;
  costoEnvio: number;
  total: number;
  descripcionEstado: string;
  // Dirección
  descripcionDireccion: string;
  descripcionBarrio: string | null;
  descripcionMunicipio: string;
  descripcionDepartamento: string;
  pais: string;
  codigoPostal: string | null;
  complemento: string | null;
  indicaciones: string | null;
  nombreDestinatario: string | null;
  telefonoContacto: string | null;
  documentoIdentidad: string | null;
  etiqueta: string | null;
  // Ítems
  detalles: ItemPedidoDetalle[];
}

export interface CreatePedidoPayload {
  idDireccion: number;
  items: {
    idVariante: number;
    cantidad: number;
    precioUnitario: number;
  }[];
  descuento?: number;
  costoEnvio?: number;
  /** Código de cupón para aplicar descuento automático en el checkout */
  codigoCupon?: string;
}

export interface DescuentoProducto {
  tieneDescuento: boolean;
  porcentaje: number;
  codigo: string;
}

// ─── Servicio centralizado de consumo HTTP ────────────────────────────────────

export const SueñosDoradosAPI = {

  // ── Categorías ──────────────────────────────────────────────────────────────
  getCategorias: async (): Promise<Categoria[]> => {
    try {
      const res = await fetch(`${API_URL}/categorias`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error("Error Categorías:", e);
      return [];
    }
  },

  // ── Productos ────────────────────────────────────────────────────────────────
  getProductos: async (idCategoria?: number): Promise<Producto[]> => {
    try {
      const url = idCategoria
        ? `${API_URL}/productos?idCategoria=${idCategoria}`
        : `${API_URL}/productos`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error("Error Productos:", e);
      return [];
    }
  },

  getProducto: async (id: number): Promise<Producto | null> => {
    try {
      const res = await fetch(`${API_URL}/productos/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error("Error Producto:", e);
      return null;
    }
  },

  // ── Variantes ────────────────────────────────────────────────────────────────
  getVariantes: async (idProducto?: number): Promise<VarianteProducto[]> => {
    try {
      const url = idProducto
        ? `${API_URL}/variantes-producto?idProducto=${idProducto}`
        : `${API_URL}/variantes-producto`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error("Error Variantes:", e);
      return [];
    }
  },

  // ── Medidas ──────────────────────────────────────────────────────────────────
  getMedidas: async (): Promise<Medida[]> => {
    try {
      const res = await fetch(`${API_URL}/medidas`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error("Error Medidas:", e);
      return [];
    }
  },

  // ── Colores ──────────────────────────────────────────────────────────────────
  getColores: async (): Promise<Color[]> => {
    try {
      const res = await fetch(`${API_URL}/colores`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error("Error Colores:", e);
      return [];
    }
  },

  // ── Auth ─────────────────────────────────────────────────────────────────────
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "Error al iniciar sesión");
    }
    return res.json();
  },

  registro: async (payload: RegistroPayload): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/auth/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "Error al registrarse");
    }
    return res.json();
  },

  getPerfil: async (token: string) => {
    const res = await fetch(`${API_URL}/auth/perfil`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("No autorizado");
    return res.json();
  },

  actualizarPerfil: async (
    token: string,
    datos: { nombreUsuario?: string; apellidoUsuario?: string; telefono?: string }
  ) => {
    const res = await fetch(`${API_URL}/auth/perfil`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(datos),
    });
    if (!res.ok) throw new Error("Error al actualizar perfil");
    return res.json();
  },

  // ── Direcciones ──────────────────────────────────────────────────────────────
  getDirecciones: async (token: string): Promise<DireccionAPI[]> => {
    const res = await fetch(`${API_URL}/direcciones`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Error al obtener direcciones");
    return res.json();
  },

  crearDireccion: async (token: string, payload: CreateDireccionPayload): Promise<DireccionAPI> => {
    const res = await fetch(`${API_URL}/direcciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "Error al crear dirección");
    }
    return res.json();
  },

  actualizarDireccion: async (
    token: string,
    id: number,
    payload: Partial<CreateDireccionPayload>
  ): Promise<DireccionAPI> => {
    const res = await fetch(`${API_URL}/direcciones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "Error al actualizar dirección");
    }
    return res.json();
  },

  eliminarDireccion: async (token: string, id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/direcciones/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al eliminar dirección");
  },

  // ── Facturas ──────────────────────────────────────────────────────────────
  // ── Descuentos ───────────────────────────────────────────────────────────────
  /**
   * Retorna el descuento activo y vigente de un producto, si existe.
   * Retorna null si no hay descuento activo.
   */
  getDescuentoProducto: async (idProducto: number): Promise<DescuentoProducto | null> => {
    try {
      const res = await fetch(`${API_URL}/descuentos/producto/${idProducto}`, { cache: "no-store" });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.tieneDescuento ? data : null;
    } catch { return null; }
  },

  /**
   * Valida un cupón en el checkout.
   * idProductos: array de idProducto del carrito para validar si aplica.
   */
  validarCupon: async (
    codigo: string,
    subtotal: number,
    idProductos: number[],
  ): Promise<{ valido: boolean; porcentaje: number; montoDescuento: number; mensaje: string }> => {
    const qs = `codigo=${encodeURIComponent(codigo)}&subtotal=${subtotal}&idProductos=${idProductos.join(",")}`;
    const res = await fetch(`${API_URL}/descuentos/validar?${qs}`, { cache: "no-store" });
    if (!res.ok) return { valido: false, porcentaje: 0, montoDescuento: 0, mensaje: "Error al validar" };
    return res.json();
  },

  /**
   * Descarga la factura en PDF de un pedido.
   * Crea un <a> temporal y dispara la descarga en el navegador.
   */
  descargarFactura: async (token: string, idPedido: number): Promise<void> => {
    const res = await fetch(`${API_URL}/facturas/pedido/${idPedido}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('No se pudo generar la factura');
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `Factura-SD-${String(idPedido).padStart(6, '0')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // ── Pedidos ──────────────────────────────────────────────────────────────────
  crearPedido: async (token: string, payload: CreatePedidoPayload) => {
    const res = await fetch(`${API_URL}/pedidos`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "Error al crear pedido");
    }
    return res.json();
  },

  getPedidos: async (token: string) => {
    const res = await fetch(`${API_URL}/pedidos`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Error al obtener pedidos");
    return res.json();
  },

  vaciarCarrito: async (token: string): Promise<void> => {
    await fetch(`${API_URL}/usuarios/carrito`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // ── Bold — Pasarela de pagos real (API Link de pagos) ────────────────────
  /**
   * Crea un link de pago Bold con monto fijo (CLOSE).
   * Bold muestra PSE, Nequi, Tarjeta y Bancolombia en una sola pantalla.
   * No requiere seleccionar banco por separado — Bold lo maneja.
   */
  crearLinkDePago: async (
    token: string,
    payload: {
      idPedido: number;
      totalCOP: number;
      descripcion: string;
      correoComprador: string;
    }
  ): Promise<{ checkoutUrl: string; linkId: string; referenceId: string }> => {
    const res = await fetch(`${API_URL}/pagos/crear`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = Array.isArray(err.message) ? err.message.join(", ") : (err.message ?? "Error al crear link de pago");
      throw new Error(msg);
    }
    const data = await res.json();
    if (!data.checkoutUrl) throw new Error("Bold no devolvió la URL del checkout");
    return {
      checkoutUrl: data.checkoutUrl,
      linkId:      data.linkId,
      referenceId: data.referenceId,
    };
  },

  /**
   * Consulta el estado de un link Bold por su linkId.
   * Estados: ACTIVE | PROCESSING | PAID | REJECTED | CANCELLED | EXPIRED
   */
  consultarEstadoPago: async (token: string, linkId: string) => {
    const res = await fetch(`${API_URL}/pagos/estado/${linkId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("No se pudo consultar el estado del pago");
    return res.json();
  },
};
