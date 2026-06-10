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

export interface RegistroPayload {
  nombreUsuario: string;
  apellidoUsuario: string;
  correoElectronico: string;
  contrasena: string;
  telefono?: string;
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
  esPrincipal?: boolean;
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

  eliminarDireccion: async (token: string, id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/direcciones/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al eliminar dirección");
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
};
