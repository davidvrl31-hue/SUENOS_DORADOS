/**
 * Servicio centralizado de consumo de la API de NestJS
 */
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

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
  /** Dirección inicial opcional — se guarda como dirección principal */
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
  idUsuario: number;
  descripcionDireccion: string;
  descripcionBarrio: string | null;
  descripcionMunicipio: string;
  descripcionDepartamento: string;
  esPrincipal: boolean;
}

export interface CreateDireccionPayload {
  descripcionDireccion: string;
  descripcionBarrio?: string;
  descripcionMunicipio: string;
  descripcionDepartamento: string;
  complemento?: string;
  codigoPostal?: string;
  indicaciones?: string;
  etiqueta?: string;
  telefonoContacto?: string;
  esPrincipal?: boolean;
}

export interface CreatePedidoPayload {
  idDireccion: number;
  items: { idVariante: number; cantidad: number; precioUnitario: number }[];
  descuento?: number;
  costoEnvio?: number;
  codigoCupon?: string;
}

// ─── Servicio ─────────────────────────────────────────────────────────────────

export const SueñosDoradosAPI = {

  // ── Categorías ────────────────────────────────────────────────────────────
  getCategorias: async (): Promise<Categoria[]> => {
    try {
      const res = await fetch(`${API_URL}/categorias`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return res.json();
    } catch (e) { console.error("Error Categorías:", e); return []; }
  },

  // ── Productos ─────────────────────────────────────────────────────────────
  getProductos: async (idCategoria?: number): Promise<Producto[]> => {
    try {
      const url = idCategoria
        ? `${API_URL}/productos?idCategoria=${idCategoria}`
        : `${API_URL}/productos`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return res.json();
    } catch (e) { console.error("Error Productos:", e); return []; }
  },

  getProducto: async (id: number): Promise<Producto | null> => {
    try {
      const res = await fetch(`${API_URL}/productos/${id}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return res.json();
    } catch (e) { console.error("Error Producto:", e); return null; }
  },

  // ── Variantes ─────────────────────────────────────────────────────────────
  getVariantes: async (idProducto?: number): Promise<VarianteProducto[]> => {
    try {
      const url = idProducto
        ? `${API_URL}/variantes-producto?idProducto=${idProducto}`
        : `${API_URL}/variantes-producto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return res.json();
    } catch (e) { console.error("Error Variantes:", e); return []; }
  },

  // ── Medidas / Colores ─────────────────────────────────────────────────────
  getMedidas: async (): Promise<Medida[]> => {
    try {
      const res = await fetch(`${API_URL}/medidas`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return res.json();
    } catch (e) { console.error("Error Medidas:", e); return []; }
  },

  getColores: async (): Promise<Color[]> => {
    try {
      const res = await fetch(`${API_URL}/colores`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return res.json();
    } catch (e) { console.error("Error Colores:", e); return []; }
  },

  // ── Auth ──────────────────────────────────────────────────────────────────
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

  // ── Direcciones ───────────────────────────────────────────────────────────
  getDirecciones: async (token: string): Promise<DireccionAPI[]> => {
    const res = await fetch(`${API_URL}/direcciones`, {
      headers: { Authorization: `Bearer ${token}` },
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

  // ── Pedidos ───────────────────────────────────────────────────────────────
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
    });
    if (!res.ok) throw new Error("Error al obtener pedidos");
    return res.json();
  },

  // ── Facturas ──────────────────────────────────────────────────────────────
  /** Retorna la URL del PDF de factura (se usa con expo-file-system) */
  getFacturaUrl: (idPedido: number): string =>
    `${API_URL}/facturas/pedido/${idPedido}`,

  // ── Descuentos ────────────────────────────────────────────────────────────
  validarCupon: async (codigo: string, subtotal: number) => {
    const res = await fetch(
      `${API_URL}/descuentos/validar?codigo=${encodeURIComponent(codigo)}&subtotal=${subtotal}`
    );
    if (!res.ok) throw new Error("Error al validar cupón");
    return res.json();
  },

  // ── Bold — Pasarela de pagos ──────────────────────────────────────────────
  crearLinkDePago: async (
    token: string,
    payload: { idPedido: number; totalCOP: number; descripcion: string; correoComprador: string }
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
    return { checkoutUrl: data.checkoutUrl, linkId: data.linkId, referenceId: data.referenceId };
  },

  consultarEstadoPago: async (token: string, linkId: string) => {
    const res = await fetch(`${API_URL}/pagos/estado/${linkId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("No se pudo consultar el estado");
    return res.json();
  },

  // ── Carrito y Favoritos (sincronización con BD) ───────────────────────────
  getCarrito: async (token: string) => {
    const res = await fetch(`${API_URL}/usuarios/carrito`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al obtener carrito");
    return res.json();
  },

  guardarCarrito: async (token: string, items: { idVariante: number; quantity: number }[]) => {
    const res = await fetch(`${API_URL}/usuarios/carrito`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) throw new Error("Error al guardar carrito");
    return res.json();
  },

  vaciarCarrito: async (token: string) => {
    await fetch(`${API_URL}/usuarios/carrito`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getFavoritos: async (token: string) => {
    const res = await fetch(`${API_URL}/usuarios/favoritos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al obtener favoritos");
    return res.json();
  },

  guardarFavoritos: async (token: string, ids: number[]) => {
    const res = await fetch(`${API_URL}/usuarios/favoritos`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error("Error al guardar favoritos");
    return res.json();
  },
};

export const API = SueñosDoradosAPI;
