import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { API, DireccionRegistroPayload } from "../services/api.service";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  idUsuario: number;
  name: string;
  apellido: string;
  email: string;
  telefono: string | null;
  idRol: number;
  token: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    apellido: string,
    email: string,
    password: string,
    telefono?: string,
    direccion?: DireccionRegistroPayload
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (datos: { nombreUsuario?: string; apellidoUsuario?: string; telefono?: string }) => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const USER_KEY = "@sd_user";
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurar sesión al iniciar
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(USER_KEY);
        if (stored) setUser(JSON.parse(stored));
      } catch { /* noop */ }
      setIsLoading(false);
    })();
  }, []);

  const saveUser = async (u: User) => {
    setUser(u);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
  };

  // ── Login ────────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await API.login({ correoElectronico: email, contrasena: password });
      await saveUser({
        idUsuario: res.usuario.idUsuario,
        name: res.usuario.nombreUsuario,
        apellido: res.usuario.apellidoUsuario,
        email: res.usuario.correoElectronico,
        telefono: res.usuario.telefono,
        idRol: res.usuario.idRol,
        token: res.access_token,
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  // ── Registro ─────────────────────────────────────────────────────────────────
  const register = useCallback(async (
    name: string,
    apellido: string,
    email: string,
    password: string,
    telefono?: string,
    direccion?: DireccionRegistroPayload
  ): Promise<boolean> => {
    try {
      const res = await API.registro({
        nombreUsuario: name,
        apellidoUsuario: apellido,
        correoElectronico: email,
        contrasena: password,
        telefono,
        direccion,
      });
      await saveUser({
        idUsuario: res.usuario.idUsuario,
        name: res.usuario.nombreUsuario,
        apellido: res.usuario.apellidoUsuario,
        email: res.usuario.correoElectronico,
        telefono: res.usuario.telefono,
        idRol: res.usuario.idRol,
        token: res.access_token,
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  // ── Actualizar perfil ────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (
    datos: { nombreUsuario?: string; apellidoUsuario?: string; telefono?: string }
  ) => {
    if (!user) return;
    await API.actualizarPerfil(user.token, datos);
    const updated: User = {
      ...user,
      name: datos.nombreUsuario ?? user.name,
      apellido: datos.apellidoUsuario ?? user.apellido,
      telefono: datos.telefono ?? user.telefono,
    };
    await saveUser(updated);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
