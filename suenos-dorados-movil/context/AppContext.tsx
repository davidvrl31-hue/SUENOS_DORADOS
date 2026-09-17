import React, { createContext, useContext, useState, useEffect } from "react";
import { NOTIFICATIONS } from "../constants/notifications";

export interface Notification {
  id: string;
  type: "order" | "promo" | "delivery" | "app" | string;
  icon: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface AppContextType {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Sin notificaciones mock — array vacío
    setNotifications([]);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider value={{ notifications, markAsRead, markAllAsRead }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}
