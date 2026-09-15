export const NOTIFICATIONS = [
    {
        id: "1",
        type: "order",
        icon: "package" as const,
        title: "Pedido en camino",
        message: "Tu pedido ORD-002 está en camino. Llegará pronto.",
        time: "Hace 2 horas",
        read: false,
    },
    {
        id: "2",
        type: "promo",
        icon: "tag" as const,
        title: "¡Oferta especial!",
        message: "30% de descuento en toda la colección de edredones este fin de semana.",
        time: "Hace 5 horas",
        read: false,
    },
    {
        id: "3",
        type: "order",
        icon: "check-circle" as const,
        title: "Pedido entregado",
        message: "Tu pedido ORD-001 fue entregado exitosamente.",
        time: "Hace 2 días",
        read: true,
    },
    {
        id: "4",
        type: "promo",
        icon: "truck" as const,
        title: "Envío gratis disponible",
        message: "Agregá $15.000 más a tu carrito y obtené envío gratis.",
        time: "Hace 3 días",
        read: true,
    },
    {
        id: "5",
        type: "info",
        icon: "info" as const,
        title: "Actualización de la app",
        message: "Hay una nueva versión disponible con mejoras de rendimiento.",
        time: "Hace 5 días",
        read: true,
    },
];

export const ICON_COLORS: Record<string, string> = {
    order: "#f5a742",
    promo: "#22c55e",
    info: "#3b82f6",
};