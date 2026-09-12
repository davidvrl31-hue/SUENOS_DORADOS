import { Feather } from "@expo/vector-icons";
import React, { memo } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../../constants/theme";

export interface Step3Data {
    descripcionDepartamento: string;
    descripcionMunicipio: string;
    descripcionDireccion: string;
    complemento: string;
    descripcionBarrio: string;
    codigoPostal: string;
    etiqueta: string;
    telefonoContacto: string;
}

export type Step3Errors = Partial<Record<keyof Step3Data, string>>;

interface RegisterStep3Props {
    data: Step3Data;
    errors: Step3Errors;
    onChange: (key: keyof Step3Data, value: string) => void;
    onBack: () => void;
    onSubmit: () => void;
    loading: boolean;
    disabled?: boolean;
    /** Si es true muestra botón "Omitir" para saltarse este paso */
    onSkip?: () => void;
}

const Field = memo(function Field({
    label,
    placeholder,
    value,
    onChangeText,
    error,
    multiline,
    keyboardType,
    optional,
}: {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (v: string) => void;
    error?: string;
    multiline?: boolean;
    keyboardType?: "default" | "numeric" | "phone-pad";
    optional?: boolean;
}) {
    return (
        <View style={s.field}>
            <Text style={s.label}>
                {label}
                {optional && <Text style={s.optional}> (opcional)</Text>}
            </Text>
            <View style={[s.inputWrap, !!error && s.inputError, multiline && s.inputMultiline]}>
                <TextInput
                    style={[s.input, multiline && s.inputMultilineText]}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.mutedDark}
                    value={value}
                    onChangeText={onChangeText}
                    multiline={multiline}
                    numberOfLines={multiline ? 2 : 1}
                    keyboardType={keyboardType ?? "default"}
                    autoCorrect={false}
                    accessibilityLabel={label}
                />
            </View>
            {!!error && <Text style={s.errorText}>{error}</Text>}
        </View>
    );
});

const RegisterStep3 = memo(function RegisterStep3({
    data,
    errors,
    onChange,
    onBack,
    onSubmit,
    loading,
    disabled,
    onSkip,
}: RegisterStep3Props) {
    return (
        <View style={s.container}>
            {/* Encabezado informativo */}
            <View style={s.infoBox}>
                <Feather name="map-pin" size={18} color={COLORS.orange} />
                <Text style={s.infoText}>
                    Agrega tu dirección de envío para recibir tus pedidos sin demoras.
                    También puedes hacerlo más adelante.
                </Text>
            </View>

            {/* Departamento */}
            <Field
                label="Departamento *"
                placeholder="Ej: Cundinamarca"
                value={data.descripcionDepartamento}
                onChangeText={(v) => onChange("descripcionDepartamento", v)}
                error={errors.descripcionDepartamento}
            />

            {/* Ciudad / Municipio */}
            <Field
                label="Ciudad / Municipio *"
                placeholder="Ej: Bogotá"
                value={data.descripcionMunicipio}
                onChangeText={(v) => onChange("descripcionMunicipio", v)}
                error={errors.descripcionMunicipio}
            />

            {/* Dirección */}
            <Field
                label="Dirección *"
                placeholder="Calle 123 # 45-67"
                value={data.descripcionDireccion}
                onChangeText={(v) => onChange("descripcionDireccion", v)}
                error={errors.descripcionDireccion}
                multiline
            />

            {/* Complemento */}
            <Field
                label="Apto / Oficina / Piso"
                placeholder="Apto 301, Torre B"
                value={data.complemento}
                onChangeText={(v) => onChange("complemento", v)}
                optional
            />

            {/* Barrio */}
            <Field
                label="Barrio"
                placeholder="Chapinero, Laureles..."
                value={data.descripcionBarrio}
                onChangeText={(v) => onChange("descripcionBarrio", v)}
                optional
            />

            {/* Código postal */}
            <Field
                label="Código postal"
                placeholder="110111"
                value={data.codigoPostal}
                onChangeText={(v) => onChange("codigoPostal", v)}
                keyboardType="numeric"
                optional
            />

            {/* Etiqueta */}
            <Field
                label="Etiqueta"
                placeholder="Casa, Oficina, Casa de mamá..."
                value={data.etiqueta}
                onChangeText={(v) => onChange("etiqueta", v)}
                optional
            />

            {/* Teléfono de contacto */}
            <Field
                label="Teléfono de contacto"
                placeholder="+57 300 000 0000"
                value={data.telefonoContacto}
                onChangeText={(v) => onChange("telefonoContacto", v)}
                keyboardType="phone-pad"
                optional
            />

            {/* Botones */}
            <View style={s.btnRow}>
                <TouchableOpacity
                    onPress={onBack}
                    style={s.backBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Volver al paso anterior"
                >
                    <Feather name="arrow-left" size={18} color={COLORS.text} />
                    <Text style={s.backBtnTxt}>Volver</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onSubmit}
                    disabled={disabled || loading}
                    style={[s.submitBtn, (disabled || loading) && s.submitBtnDisabled]}
                    accessibilityRole="button"
                    accessibilityLabel="Crear cuenta"
                >
                    {loading ? (
                        <Text style={s.submitBtnTxt}>Creando...</Text>
                    ) : (
                        <>
                            <Text style={s.submitBtnTxt}>Crear cuenta</Text>
                            <Feather name="check" size={18} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Omitir dirección */}
            {onSkip && (
                <TouchableOpacity
                    onPress={onSkip}
                    style={s.skipBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Omitir, agregar dirección más adelante"
                >
                    <Text style={s.skipTxt}>Omitir, lo haré después</Text>
                </TouchableOpacity>
            )}
        </View>
    );
});

export default RegisterStep3;

const s = StyleSheet.create({
    container: { gap: 14 },
    infoBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        backgroundColor: COLORS.amber,
        borderRadius: 12,
        padding: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.text,
        lineHeight: 19,
    },
    field: { gap: 6 },
    label: {
        color: COLORS.text,
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    optional: {
        color: COLORS.muted,
        fontWeight: "400",
        textTransform: "none",
        letterSpacing: 0,
        fontSize: 11,
    },
    inputWrap: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.card,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 14,
    },
    inputMultiline: { paddingVertical: 10 },
    inputError: { borderColor: COLORS.red },
    input: { flex: 1, height: 48, fontSize: 15, color: COLORS.text },
    inputMultilineText: { height: undefined, minHeight: 48, textAlignVertical: "top" },
    errorText: { color: COLORS.red, fontSize: 12, marginLeft: 4 },
    btnRow: { flexDirection: "row", gap: 10, marginTop: 8 },
    backBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        flex: 1,
        height: 52,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        backgroundColor: COLORS.card,
    },
    backBtnTxt: { color: COLORS.text, fontSize: 15, fontWeight: "700" },
    submitBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        flex: 2,
        height: 52,
        borderRadius: 14,
        backgroundColor: COLORS.orange,
        elevation: 4,
    },
    submitBtnDisabled: { backgroundColor: COLORS.mutedDark, elevation: 0 },
    submitBtnTxt: { color: "#fff", fontSize: 15, fontWeight: "800" },
    skipBtn: {
        alignItems: "center",
        paddingVertical: 12,
    },
    skipTxt: {
        color: COLORS.muted,
        fontSize: 13,
        textDecorationLine: "underline",
    },
});
