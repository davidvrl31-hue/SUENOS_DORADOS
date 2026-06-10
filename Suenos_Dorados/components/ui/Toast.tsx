import { Feather } from "@expo/vector-icons";
import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info";

interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextType | null>(null);

// ─── Toast item ───────────────────────────────────────────────────────────────

function ToastItem({ item, onDone }: { item: ToastMessage; onDone: () => void }) {
    const opacity = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.sequence([
            Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.delay(2000),
            Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(onDone);
    }, []);

    const icon =
        item.type === "success" ? "check-circle" : item.type === "error" ? "x-circle" : "info";
    const color =
        item.type === "success" ? COLORS.green : item.type === "error" ? COLORS.red : COLORS.orange;

    return (
        <Animated.View style={[s.toast, { opacity }]}>
            <Feather name={icon} size={16} color={color} />
            <Text style={s.toastTxt}>{item.message}</Text>
        </Animated.View>
    );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const counter = useRef(0);

    const showToast = useCallback((message: string, type: ToastType = "success") => {
        const id = ++counter.current;
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const remove = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <View style={s.container} pointerEvents="none">
                {toasts.map((t) => (
                    <ToastItem key={t.id} item={t} onDone={() => remove(t.id)} />
                ))}
            </View>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 100,
        left: 20,
        right: 20,
        gap: 8,
        zIndex: 9999,
    },
    toast: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#2d2520",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    toastTxt: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
        flex: 1,
    },
});