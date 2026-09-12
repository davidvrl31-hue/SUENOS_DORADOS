import { Feather } from "@expo/vector-icons";
import React, { memo, useCallback } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../../constants/theme";

export interface Step2Data {
    acceptTerms: boolean;
    acceptPrivacy: boolean;
    acceptMarketing: boolean;
}

interface RegisterStep2Props {
    data: Step2Data;
    onChange: (key: keyof Step2Data, value: boolean) => void;
    onBack: () => void;
    onSubmit: () => void;
    loading?: boolean;
    disabled?: boolean;
}

const RegisterStep2 = memo(function RegisterStep2({
    data,
    onChange,
    onBack,
    onSubmit,
    loading,
    disabled,
}: RegisterStep2Props) {
    const toggleField = useCallback(
        (key: keyof Step2Data) => {
            onChange(key, !data[key]);
        },
        [data, onChange]
    );

    return (
        <View style={s.container}>
            <Text style={s.sectionTitle}>Términos y condiciones</Text>
            <Text style={s.sectionSubtitle}>
                Para continuar, por favor acepta los términos obligatorios
            </Text>

            {/* Términos y condiciones */}
            <CheckboxItem
                checked={data.acceptTerms}
                onToggle={() => toggleField("acceptTerms")}
                required
            >
                <Text style={s.checkText}>
                    Acepto los{" "}
                    <Text style={s.linkText}>Términos y Condiciones</Text>
                </Text>
            </CheckboxItem>

            {/* Política de privacidad */}
            <CheckboxItem
                checked={data.acceptPrivacy}
                onToggle={() => toggleField("acceptPrivacy")}
                required
            >
                <Text style={s.checkText}>
                    Acepto la{" "}
                    <Text style={s.linkText}>Política de Privacidad</Text>
                </Text>
            </CheckboxItem>

            <View style={s.divider} />

            {/* Marketing (opcional) */}
            <CheckboxItem
                checked={data.acceptMarketing}
                onToggle={() => toggleField("acceptMarketing")}
                required={false}
            >
                <Text style={s.checkText}>
                    <Text style={s.optionalLabel}>(Opcional)</Text> Deseo recibir
                    comunicaciones, promociones y ofertas especiales
                </Text>
            </CheckboxItem>

            {/* Botones */}
            <View style={s.buttonsRow}>
                <TouchableOpacity
                    onPress={onBack}
                    disabled={loading}
                    activeOpacity={0.85}
                    style={s.backBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Volver al paso 1"
                >
                    <Feather name="arrow-left" size={18} color={COLORS.text} />
                    <Text style={s.backTxt}>Volver</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onSubmit}
                    disabled={disabled || loading}
                    activeOpacity={0.85}
                    style={[s.submitBtn, (disabled || loading) && s.submitBtnDisabled]}
                    accessibilityRole="button"
                    accessibilityLabel="Crear cuenta"
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <Text style={s.submitTxt}>Continuar</Text>
                            <Feather name="arrow-right" size={18} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
});

interface CheckboxItemProps {
    checked: boolean;
    onToggle: () => void;
    required?: boolean;
    children: React.ReactNode;
}

const CheckboxItem = memo(function CheckboxItem({
    checked,
    onToggle,
    required = false,
    children,
}: CheckboxItemProps) {
    return (
        <TouchableOpacity
            onPress={onToggle}
            activeOpacity={0.7}
            style={s.checkboxRow}
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
        >
            <View style={[s.checkbox, checked && s.checkboxActive]}>
                {checked && <Feather name="check" size={14} color="#fff" />}
            </View>
            <View style={s.checkContent}>
                {children}
                {required && <Text style={s.requiredMark}>*</Text>}
            </View>
        </TouchableOpacity>
    );
});

export default RegisterStep2;

const s = StyleSheet.create({
    container: {
        gap: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: COLORS.text,
        marginBottom: -8,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: COLORS.muted,
        lineHeight: 18,
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        paddingVertical: 4,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        marginTop: 1,
        borderWidth: 2,
        borderColor: COLORS.mutedDark,
        backgroundColor: COLORS.card,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxActive: {
        backgroundColor: COLORS.orange,
        borderColor: COLORS.orange,
    },
    checkContent: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 4,
    },
    checkText: {
        color: COLORS.text,
        fontSize: 14,
        lineHeight: 20,
    },
    linkText: {
        color: COLORS.orange,
        fontWeight: "700",
        textDecorationLine: "underline",
    },
    optionalLabel: {
        color: COLORS.muted,
        fontSize: 12,
        fontWeight: "600",
    },
    requiredMark: {
        color: COLORS.red,
        fontSize: 14,
        fontWeight: "700",
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 4,
    },
    buttonsRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
    backBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 52,
        borderRadius: 14,
        backgroundColor: COLORS.card,
        borderWidth: 2,
        borderColor: COLORS.border,
    },
    backTxt: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: "700",
    },
    submitBtn: {
        flex: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 52,
        borderRadius: 14,
        backgroundColor: COLORS.orange,
        elevation: 4,
    },
    submitBtnDisabled: {
        backgroundColor: COLORS.mutedDark,
        elevation: 0,
    },
    submitTxt: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
});
