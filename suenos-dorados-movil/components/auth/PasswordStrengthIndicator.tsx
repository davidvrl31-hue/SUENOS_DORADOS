import React, { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants/theme";

interface PasswordStrengthIndicatorProps {
    password: string;
}

type Strength = "weak" | "medium" | "strong" | null;

interface StrengthInfo {
    label: string;
    color: string;
    bars: number;
}

const getStrengthInfo = (strength: Strength): StrengthInfo => {
    switch (strength) {
        case "weak":
            return { label: "Débil", color: COLORS.red, bars: 1 };
        case "medium":
            return { label: "Media", color: "#F59E0B", bars: 2 };
        case "strong":
            return { label: "Fuerte", color: COLORS.green, bars: 3 };
        default:
            return { label: "", color: COLORS.mutedDark, bars: 0 };
    }
};

const calculateStrength = (password: string): Strength => {
    if (!password) return null;
    
    let score = 0;
    
    // Longitud
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    
    // Tiene mayúscula
    if (/[A-Z]/.test(password)) score++;
    
    // Tiene minúscula
    if (/[a-z]/.test(password)) score++;
    
    // Tiene número
    if (/[0-9]/.test(password)) score++;
    
    // Tiene carácter especial
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return "weak";
    if (score <= 4) return "medium";
    return "strong";
};

const PasswordStrengthIndicator = memo(function PasswordStrengthIndicator({ 
    password 
}: PasswordStrengthIndicatorProps) {
    const strength = useMemo(() => calculateStrength(password), [password]);
    const info = useMemo(() => getStrengthInfo(strength), [strength]);
    
    const criteria = useMemo(() => {
        if (!password) return null;
        
        return {
            length: password.length >= 6,
            upper: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password),
        };
    }, [password]);

    if (!password) return null;

    return (
        <View style={s.container}>
            {/* Barra de fortaleza */}
            <View style={s.barsRow}>
                {[1, 2, 3].map((index) => (
                    <View
                        key={index}
                        style={[
                            s.bar,
                            index <= info.bars && { backgroundColor: info.color },
                        ]}
                    />
                ))}
                <Text style={[s.label, { color: info.color }]}>{info.label}</Text>
            </View>

            {/* Criterios */}
            {criteria && (
                <View style={s.criteria}>
                    <CriterionItem
                        met={criteria.length}
                        text="Mínimo 6 caracteres"
                    />
                    <CriterionItem met={criteria.upper} text="Una mayúscula" />
                    <CriterionItem met={criteria.number} text="Un número" />
                    <CriterionItem met={criteria.special} text="Un carácter especial" />
                </View>
            )}
        </View>
    );
});

interface CriterionItemProps {
    met: boolean;
    text: string;
}

const CriterionItem = memo(function CriterionItem({ met, text }: CriterionItemProps) {
    return (
        <View style={s.criterion}>
            <View style={[s.dot, met && s.dotMet]} />
            <Text style={[s.criterionText, met && s.criterionTextMet]}>{text}</Text>
        </View>
    );
});

export default PasswordStrengthIndicator;

const s = StyleSheet.create({
    container: {
        gap: 8,
    },
    barsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    bar: {
        height: 4,
        flex: 1,
        backgroundColor: COLORS.border,
        borderRadius: 2,
    },
    label: {
        fontSize: 12,
        fontWeight: "600",
        marginLeft: 4,
    },
    criteria: {
        gap: 4,
    },
    criterion: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.mutedDark,
    },
    dotMet: {
        backgroundColor: COLORS.green,
    },
    criterionText: {
        fontSize: 11,
        color: COLORS.muted,
    },
    criterionTextMet: {
        color: COLORS.green,
        fontWeight: "600",
    },
});
