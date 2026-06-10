import { Feather } from "@expo/vector-icons";
import { Linking } from "react-native";

// ─── Menú del perfil ──────────────────────────────────────────────────────────
export interface MenuItem {
    icon: React.ComponentProps<typeof Feather>["name"];
    label: string;
    route?: string;
    danger?: boolean;
}

export const PROFILE_MENU_ITEMS: MenuItem[] = [
    { icon: "package", label: "Mis pedidos", route: "/(tabs)/profile/orders" },
    { icon: "map-pin", label: "Mis direcciones", route: "/(tabs)/profile/addresses" },
    { icon: "credit-card", label: "Métodos de pago", route: "/(tabs)/profile/payments" },
    { icon: "bell", label: "Notificaciones", route: "/(tabs)/profile/notifications" },
    { icon: "help-circle", label: "Ayuda y soporte", route: "/(tabs)/profile/support" },
    { icon: "log-out", label: "Cerrar sesión", danger: true },
];

// ─── Soporte - Contacto ───────────────────────────────────────────────────────
export interface ContactItem {
    icon: React.ComponentProps<typeof Feather>["name"];
    label: string;
    sub: string;
    action: () => void;
}

export const SUPPORT_CONTACT: ContactItem[] = [
    {
        icon: "message-circle",
        label: "Chat en vivo",
        sub: "Respondemos en minutos",
        action: () => { },
    },
    {
        icon: "mail",
        label: "Enviar un correo",
        sub: "soporte@suenosDorados.com",
        action: () => Linking.openURL("mailto:soporte@suenosDorados.com"),
    },
    {
        icon: "phone",
        label: "Llamar al soporte",
        sub: "+57 300 123 4567",
        action: () => Linking.openURL("tel:+573001234567"),
    },
];

// ─── Soporte - FAQ ────────────────────────────────────────────────────────────
export interface FAQItem {
    q: string;
    a: string;
}

export const SUPPORT_FAQS: FAQItem[] = [
    {
        q: "¿Cuánto tarda el envío?",
        a: "Los envíos demoran entre 3 y 5 días hábiles dependiendo de tu ciudad.",
    },
    {
        q: "¿Puedo devolver un producto?",
        a: "Sí, tenés 30 días desde la entrega para hacer una devolución sin costo.",
    },
    {
        q: "¿Cómo hago seguimiento de mi pedido?",
        a: "En la sección 'Mis pedidos' podés ver el estado de cada uno en tiempo real.",
    },
    {
        q: "¿Qué métodos de pago aceptan?",
        a: "Aceptamos tarjetas débito/crédito, PSE, Nequi y pago contra entrega.",
    },
    {
        q: "¿Tienen garantía los productos?",
        a: "Todos nuestros productos tienen garantía de 6 meses por defectos de fábrica.",
    },
];

// ─── Notificaciones ───────────────────────────────────────────────────────────
export interface NotificationItem {
    id: string;
    type: "order" | "promo" | "delivered" | "shipping" | "info";
    icon: React.ComponentProps<typeof Feather>["name"];
    title: string;
    message: string;
    time: string;
    read: boolean;
}

export const NOTIFICATION_ITEMS: NotificationItem[] = [
    {
        id: "1",
        type: "order",
        icon: "package",
        title: "Pedido en camino",
        message: "Tu pedido ORD-002 está en camino. Llegará pronto.",
        time: "Hace 2 horas",
        read: false,
    },
    {
        id: "2",
        type: "promo",
        icon: "tag",
        title: "¡Oferta especial!",
        message: "30% de descuento en toda la colección de edredones este fin de semana.",
        time: "Hace 5 horas",
        read: false,
    },
    {
        id: "3",
        type: "delivered",
        icon: "check-circle",
        title: "Pedido entregado",
        message: "Tu pedido ORD-001 fue entregado exitosamente.",
        time: "Hace 2 días",
        read: true,
    },
    {
        id: "4",
        type: "shipping",
        icon: "truck",
        title: "Envío gratis disponible",
        message: "Agregá $15.000 más a tu carrito y obtené envío gratis.",
        time: "Hace 3 días",
        read: true,
    },
    {
        id: "5",
        type: "info",
        icon: "info",
        title: "Actualización de la app",
        message: "Hay una nueva versión disponible con mejoras de rendimiento.",
        time: "Hace 5 días",
        read: true,
    },
];

// ─── Métodos de pago ──────────────────────────────────────────────────────────
export type PaymentType = "tarjeta" | "pse" | "efectivo";

export interface PaymentTypeOption {
    type: PaymentType;
    label: string;
    icon: React.ComponentProps<typeof Feather>["name"];
}

export const PAYMENT_TYPES: PaymentTypeOption[] = [
    { type: "tarjeta", label: "Tarjeta", icon: "credit-card" },
    { type: "pse", label: "PSE", icon: "globe" },
    { type: "efectivo", label: "Efectivo", icon: "dollar-sign" },
];
