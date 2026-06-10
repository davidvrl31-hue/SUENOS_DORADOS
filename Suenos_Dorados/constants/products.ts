export interface Product {
    id: string;
    name: string;
    desc: string;
    category: string;
    price: number;
    originalPrice?: number;
    badge?: string;
    image: string;
    accent?: string;
    cardBg?: string;
}

export const ALL_PRODUCTS: Product[] = [
    {
        id: "1",
        name: "Edredón Nórdico Premium",
        desc: "Relleno de microfibra, doble funda",
        category: "Edredones",
        price: 85000,
        originalPrice: 110000,
        badge: "Más vendido",
        image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80",
        accent: "#f5a742",
        cardBg: "#fef3e2",
    },
    {
        id: "2",
        name: "Cobija Sherpa Ultra Soft",
        desc: "Suavidad extrema, ideal para invierno",
        category: "Cobijas",
        price: 45000,
        originalPrice: 60000,
        badge: "Nuevo",
        image: "https://images.unsplash.com/photo-1583845112203-29329902332e?w=400&q=80",
        accent: "#5b9bd5",
        cardBg: "#f0f7ff",
    },
    {
        id: "3",
        name: "Set King Size Plumas",
        desc: "Edredón + 2 almohadas + funda",
        category: "Edredones",
        price: 130000,
        originalPrice: 160000,
        badge: "Premium",
        image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80",
        accent: "#9b72cf",
        cardBg: "#f5f0ff",
    },
    {
        id: "4",
        name: "Almohada Viscoelástica",
        desc: "Soporte cervical adaptable",
        category: "Almohadas",
        price: 28000,
        image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&q=80",
    },
    {
        id: "5",
        name: "Protector de Colchón",
        desc: "Impermeable y antialérgico",
        category: "Accesorios",
        price: 19000,
        originalPrice: 25000,
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
    },
    {
        id: "6",
        name: "Funda Nórdica 2 pzs",
        desc: "100% algodón, fácil lavado",
        category: "Accesorios",
        price: 35000,
        originalPrice: 42000,
        image: "https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=400&q=80",
    },
    {
        id: "7",
        name: "Cobija Bebé Fleece",
        desc: "Suave y segura para bebés",
        category: "Cobijas",
        price: 14000,
        image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80",
    },
    {
        id: "8",
        name: "Almohada Cervical Pro",
        desc: "Diseño ergonómico para el cuello",
        category: "Almohadas",
        price: 35000,
        originalPrice: 48000,
        image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&q=80",
    },
];

export const FEATURED_PRODUCTS = ALL_PRODUCTS.filter((p) => p.badge);
export const RECENT_PRODUCTS = ALL_PRODUCTS.slice(3);

export const CATEGORIES = ["Todo", "Edredones", "Cobijas", "Almohadas", "Accesorios"];