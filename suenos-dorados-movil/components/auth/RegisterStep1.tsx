import { Feather } from "@expo/vector-icons";
import React, { memo, useCallback, useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../../constants/theme";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";

export interface Step1Data {
    nombre: string;
    apellido: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
}

export type Step1Errors = Partial<Record<keyof Step1Data, string>>;

interface RegisterStep1Props {
    data: Step1Data;
    errors: Step1Errors;
    onChange: (key: keyof Step1Data, value: string) => void;
    onContinue: () => void;
    disabled?: boolean;
}

const RegisterStep1 = memo(function RegisterStep1({
    data,
    errors,
    onChange,
    onContinue,
    disabled,
}: RegisterStep1Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const toggleShowPassword = useCallback(
        () => setShowPassword((v) => !v),
        []
    );
    const toggleShowConfirmPassword = useCallback(
        () => setShowConfirmPassword((v) => !v),
        []
    );

    const hasError = (key: keyof Step1Data) => !!errors[key];
    const isValid = (key: keyof Step1Data) => {
        if (!data[key]) return false;
        if (hasError(key)) return false;
        return true;
    };

    return (
        <View style={s.container}>
            {/* Nombre */}
            <View style={s.field}>
                <Text style={s.label}>Nombre *</Text>
                <View style={[s.inputWrap, hasError("nombre") && s.inputError]}>
                    <TextInput
                        style={s.input}
                        placeholder="Juan"
                        placeholderTextColor={COLORS.mutedDark}
                        value={data.nombre}
                        onChangeText={(v) => onChange("nombre", v)}
                        autoCapitalize="words"
                        autoCorrect={false}
                        accessibilityLabel="Nombre"
                    />
                    {isValid("nombre") && (
                        <Feather name="check-circle" size={18} color={COLORS.green} />
                    )}
                </View>
                {hasError("nombre") && (
                    <Text style={s.errorText}>{errors.nombre}</Text>
                )}
            </View>

            {/* Apellido */}
            <View style={s.field}>
                <Text style={s.label}>Apellido *</Text>
                <View style={[s.inputWrap, hasError("apellido") && s.inputError]}>
                    <TextInput
                        style={s.input}
                        placeholder="García"
                        placeholderTextColor={COLORS.mutedDark}
                        value={data.apellido}
                        onChangeText={(v) => onChange("apellido", v)}
                        autoCapitalize="words"
                        autoCorrect={false}
                        accessibilityLabel="Apellido"
                    />
                    {isValid("apellido") && (
                        <Feather name="check-circle" size={18} color={COLORS.green} />
                    )}
                </View>
                {hasError("apellido") && (
                    <Text style={s.errorText}>{errors.apellido}</Text>
                )}
            </View>

            {/* Email */}
            <View style={s.field}>
                <Text style={s.label}>Correo electrónico *</Text>
                <View style={[s.inputWrap, hasError("email") && s.inputError]}>
                    <TextInput
                        style={s.input}
                        placeholder="tu@correo.com"
                        placeholderTextColor={COLORS.mutedDark}
                        value={data.email}
                        onChangeText={(v) => onChange("email", v)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        accessibilityLabel="Correo electrónico"
                    />
                    {isValid("email") && (
                        <Feather name="check-circle" size={18} color={COLORS.green} />
                    )}
                </View>
                {hasError("email") && (
                    <Text style={s.errorText}>{errors.email}</Text>
                )}
            </View>

            {/* Teléfono */}
            <View style={s.field}>
                <Text style={s.label}>Teléfono (opcional)</Text>
                <View style={s.inputWrap}>
                    <TextInput
                        style={s.input}
                        placeholder="+57 300 000 0000"
                        placeholderTextColor={COLORS.mutedDark}
                        value={data.phone}
                        onChangeText={(v) => onChange("phone", v)}
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                        autoCorrect={false}
                        accessibilityLabel="Teléfono"
                    />
                </View>
            </View>

            {/* Contraseña */}
            <View style={s.field}>
                <Text style={s.label}>Contraseña *</Text>
                <View style={[s.inputWrap, hasError("password") && s.inputError]}>
                    <TextInput
                        style={s.input}
                        placeholder="Mínimo 6 caracteres"
                        placeholderTextColor={COLORS.mutedDark}
                        value={data.password}
                        onChangeText={(v) => onChange("password", v)}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        accessibilityLabel="Contraseña"
                    />
                    <TouchableOpacity
                        onPress={toggleShowPassword}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityLabel={showPassword ? "Ocultar" : "Mostrar"}
                        accessibilityRole="button"
                    >
                        <Feather
                            name={showPassword ? "eye" : "eye-off"}
                            size={18}
                            color={COLORS.mutedDark}
                        />
                    </TouchableOpacity>
                </View>
                {hasError("password") && (
                    <Text style={s.errorText}>{errors.password}</Text>
                )}
                {!hasError("password") && data.password && (
                    <View style={s.strengthContainer}>
                        <PasswordStrengthIndicator password={data.password} />
                    </View>
                )}
            </View>

            {/* Confirmar contraseña */}
            <View style={s.field}>
                <Text style={s.label}>Confirmar contraseña *</Text>
                <View
                    style={[
                        s.inputWrap,
                        hasError("confirmPassword") && s.inputError,
                    ]}
                >
                    <TextInput
                        style={s.input}
                        placeholder="Repite tu contraseña"
                        placeholderTextColor={COLORS.mutedDark}
                        value={data.confirmPassword}
                        onChangeText={(v) => onChange("confirmPassword", v)}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        accessibilityLabel="Confirmar contraseña"
                    />
                    <TouchableOpacity
                        onPress={toggleShowConfirmPassword}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityLabel={
                            showConfirmPassword ? "Ocultar" : "Mostrar"
                        }
                        accessibilityRole="button"
                    >
                        <Feather
                            name={showConfirmPassword ? "eye" : "eye-off"}
                            size={18}
                            color={COLORS.mutedDark}
                        />
                    </TouchableOpacity>
                </View>
                {hasError("confirmPassword") && (
                    <Text style={s.errorText}>{errors.confirmPassword}</Text>
                )}
                {isValid("confirmPassword") &&
                    data.password === data.confirmPassword && (
                        <View style={s.successRow}>
                            <Feather
                                name="check-circle"
                                size={14}
                                color={COLORS.green}
                            />
                            <Text style={s.successText}>Las contraseñas coinciden</Text>
                        </View>
                    )}
            </View>

            {/* Botón Continuar */}
            <TouchableOpacity
                onPress={onContinue}
                disabled={disabled}
                activeOpacity={0.85}
                style={[s.continueBtn, disabled && s.continueBtnDisabled]}
                accessibilityRole="button"
                accessibilityLabel="Continuar al paso 2"
            >
                <Text style={s.continueTxt}>Continuar</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
            </TouchableOpacity>
        </View>
    );
});

export default RegisterStep1;

const s = StyleSheet.create({
    container: {
        gap: 14,
    },
    field: {
        gap: 6,
    },
    label: {
        color: COLORS.text,
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    inputWrap: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.card,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        gap: 8,
    },
    inputError: {
        borderColor: COLORS.red,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 15,
        color: COLORS.text,
    },
    errorText: {
        color: COLORS.red,
        fontSize: 12,
        marginLeft: 4,
    },
    strengthContainer: {
        marginTop: 4,
    },
    successRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 4,
    },
    successText: {
        color: COLORS.green,
        fontSize: 12,
        fontWeight: "600",
    },
    continueBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 52,
        borderRadius: 14,
        marginTop: 8,
        backgroundColor: COLORS.orange,
        elevation: 4,
    },
    continueBtnDisabled: {
        backgroundColor: COLORS.mutedDark,
        elevation: 0,
    },
    continueTxt: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
});
