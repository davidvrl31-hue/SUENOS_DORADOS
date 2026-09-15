/** Formatea número a pesos colombianos: $85.000 */
export function fmt(n: number): string {
    return "$" + n.toLocaleString("es-CO");
}

/** Calcula el porcentaje de descuento: "-23%" */
export function pct(original: number, sale: number): string {
    return "-" + Math.round((1 - sale / original) * 100) + "%";
}

/** Genera un ID único simple */
export function uid(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Formatea fecha ISO a string legible */
export function fmtDate(iso: string): string {
    return new Date(iso).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

/** Etiqueta de estado del pedido */
export function orderStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        pendiente: "Pendiente",
        en_camino: "En camino",
        entregado: "Entregado",
        cancelado: "Cancelado",
    };
    return labels[status] ?? status;
}

/** Color de badge del estado */
export function orderStatusColor(status: string): string {
    const colors: Record<string, string> = {
        pendiente: "#f5a742",
        en_camino: "#3b82f6",
        entregado: "#22c55e",
        cancelado: "#ef4444",
    };
    return colors[status] ?? "#b0a090";
}