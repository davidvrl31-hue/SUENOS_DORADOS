import Constants from "expo-constants";

// En desarrollo usa la IP del servidor de Expo automáticamente
// En producción usa la URL real del servidor
const getApiUrl = (): string => {
  if (__DEV__) {
    // Expo Go: obtiene la IP del PC que corre el servidor automáticamente
    const expoHost = Constants.expoConfig?.hostUri?.split(":")[0];
    if (expoHost) return `http://${expoHost}:3000`;
    // Fallback emulador Android
    return "http://10.0.2.2:3000";
  }
  // Producción — cambia esto cuando tengas servidor en la nube
  return "http://192.168.1.11:3000";
};

const API_URL = getApiUrl();

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
  precioMinimo?: number;
  imagenUrl?: string;
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

export interface CreatePedidoPayload {
  idDireccion: number;
  items: { idVariante: number; cantidad: number; precioUnitario: number }[];
  costoEnvio?: number;
  descuento?: number;
}

// ─── Helper interno ───────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = Array.isArray(body.message)
      ? body.message.join(", ")
      : body.message ?? `Error ${res.status}`;
    throw new Error(msg);
  }
  return res.json();
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const API = {

  // ── Catálogo ─────────────────────────────────────────────────────────────────
  getCategorias: () =>
    apiFetch<Categoria[]>("/categorias"),

  getProductos: (idCategoria?: number) =>
    apiFetch<Producto[]>(
      idCategoria ? `/productos?idCategoria=${idCategoria}` : "/productos"
    ),

  getProducto: (id: number) =>
    apiFetch<Producto>(`/productos/${id}`),

  getVariantes: (idProducto?: number) =>
    apiFetch<VarianteProducto[]>(
      idProducto ? `/variantes-producto?idProducto=${idProducto}` : "/variantes-producto"
    ),

  getMedidas: () =>
    apiFetch<Medida[]>("/medidas"),

  getColores: () =>
    apiFetch<Color[]>("/colores"),

  // ── Auth ─────────────────────────────────────────────────────────────────────
  login: (correoElectronico: string, contrasena: string) =>
    apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ correoElectronico, contrasena }),
    }),

  registro: (
    nombreUsuario: string,
    apellidoUsuario: string,
    correoElectronico: string,
    contrasena: string,
    telefono?: string
  ) =>
    apiFetch<AuthResponse>("/auth/registro", {
      method: "POST",
      body: JSON.stringify({ nombreUsuario, apellidoUsuario, correoElectronico, contrasena, telefono }),
    }),

  getPerfil: (token: string) =>
    apiFetch<AuthResponse["usuario"]>("/auth/perfil", {}, token),

  actualizarPerfil: (
    token: string,
    datos: { nombreUsuario?: string; apellidoUsuario?: string; telefono?: string }
  ) =>
    apiFetch("/auth/perfil", { method: "PATCH", body: JSON.stringify(datos) }, token),

  // ── Direcciones ──────────────────────────────────────────────────────────────
  getDirecciones: (token: string) =>
    apiFetch<DireccionAPI[]>("/direcciones", {}, token),

  crearDireccion: (
    token: string,
    data: {
      descripcionDireccion: string;
      descripcionBarrio?: string;
      descripcionMunicipio: string;
      descripcionDepartamento: string;
      esPrincipal?: boolean;
    }
  ) =>
    apiFetch<DireccionAPI>("/direcciones", { method: "POST", body: JSON.stringify(data) }, token),

  eliminarDireccion: (token: string, id: number) =>
    apiFetch(`/direcciones/${id}`, { method: "DELETE" }, token),

  // ── Pedidos ──────────────────────────────────────────────────────────────────
  crearPedido: (token: string, payload: CreatePedidoPayload) =>
    apiFetch("/pedidos", { method: "POST", body: JSON.stringify(payload) }, token),

  getPedidos: (token: string) =>
    apiFetch<unknown[]>("/pedidos", {}, token),
};
