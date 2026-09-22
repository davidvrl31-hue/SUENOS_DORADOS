import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    KeyboardAvoidingView, Platform, ScrollView, StatusBar,
    StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import CompactHeader from "./CompactHeader";
import RegisterStep1, { Step1Data, Step1Errors } from "./RegisterStep1";
import RegisterStep2, { Step2Data } from "./RegisterStep2";
import RegisterStep3, { Step3Data, Step3Errors } from "./RegisterStep3";
import StepIndicator from "./StepIndicator";

const INITIAL_STEP1: Step1Data = { nombre: "", apellido: "", email: "", phone: "", password: "", confirmPassword: "" };
const INITIAL_STEP2: Step2Data = { acceptTerms: false, acceptPrivacy: false, acceptMarketing: false };
const INITIAL_STEP3: Step3Data = {
    descripcionDepartamento: "", descripcionMunicipio: "", descripcionDireccion: "",
    complemento: "", descripcionBarrio: "", codigoPostal: "", etiqueta: "", telefonoContacto: "",
};

const STEPS = ["Datos personales", "Términos legales", "Dirección de envío"];

const validateStep1 = (data: Step1Data): Step1Errors => {
    const e: Step1Errors = {};
    if (!data.nombre.trim()) e.nombre = "El nombre es obligatorio";
    if (!data.apellido.trim()) e.apellido = "El apellido es obligatorio";
    if (!data.email.trim()) e.email = "El correo es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "Ingresa un correo válido";
    if (!data.password.trim()) {
        e.password = "La contraseña es obligatoria";
    } else if (data.password.length < 6) {
        e.password = "Mínimo 6 caracteres";
    } else if (!/[A-Z]/.test(data.password)) {
        e.password = "Debe contener al menos una mayúscula";
    } else if (!/[0-9]/.test(data.password)) {
        e.password = "Debe contener al menos un número";
    } else if (!/[^A-Za-z0-9]/.test(data.password)) {
        e.password = "Debe contener al menos un carácter especial";
    }
    if (!data.confirmPassword.trim()) e.confirmPassword = "Confirma tu contraseña";
    else if (data.password && data.confirmPassword !== data.password) e.confirmPassword = "Las contraseñas no coinciden";
    return e;
};

const validateStep3 = (data: Step3Data): Step3Errors => {
    const e: Step3Errors = {};
    if (!data.descripcionDepartamento.trim()) e.descripcionDepartamento = "El departamento es obligatorio";
    if (!data.descripcionMunicipio.trim()) e.descripcionMunicipio = "La ciudad es obligatoria";
    if (!data.descripcionDireccion.trim()) e.descripcionDireccion = "La dirección es obligatoria";
    return e;
};

export default function RegisterForm() {
    const router = useRouter();
    const { register } = useAuth();

    const [step, setStep] = useState(1);
    const [step1Data, setStep1Data] = useState<Step1Data>(INITIAL_STEP1);
    const [step1Errors, setStep1Errors] = useState<Step1Errors>({});
    const [step2Data, setStep2Data] = useState<Step2Data>(INITIAL_STEP2);
    const [step3Data, setStep3Data] = useState<Step3Data>(INITIAL_STEP3);
    const [step3Errors, setStep3Errors] = useState<Step3Errors>({});
    const [loading, setLoading] = useState(false);

    useFocusEffect(useCallback(() => {
        return () => {
            setStep(1);
            setStep1Data(INITIAL_STEP1); setStep1Errors({});
            setStep2Data(INITIAL_STEP2);
            setStep3Data(INITIAL_STEP3); setStep3Errors({});
            setLoading(false);
        };
    }, []));

    // ── Paso 1 ────────────────────────────────────────────────────────────────
    const handleStep1Change = useCallback((key: keyof Step1Data, value: string) => {
        setStep1Data((p) => ({ ...p, [key]: value }));
        setStep1Errors((p) => { const { [key]: _, ...r } = p; return r; });
    }, []);

    const handleStep1Continue = useCallback(() => {
        const errors = validateStep1(step1Data);
        if (Object.keys(errors).length > 0) { setStep1Errors(errors); return; }
        setStep1Errors({}); setStep(2);
    }, [step1Data]);

    const canContinueStep1 = useMemo(() => Object.keys(validateStep1(step1Data)).length === 0, [step1Data]);

    // ── Paso 2 ────────────────────────────────────────────────────────────────
    const handleStep2Change = useCallback((key: keyof Step2Data, value: boolean) => {
        setStep2Data((p) => ({ ...p, [key]: value }));
    }, []);

    const canContinueStep2 = useMemo(
        () => step2Data.acceptTerms && step2Data.acceptPrivacy,
        [step2Data]
    );

    // ── Paso 3 ────────────────────────────────────────────────────────────────
    const handleStep3Change = useCallback((key: keyof Step3Data, value: string) => {
        setStep3Data((p) => ({ ...p, [key]: value }));
        setStep3Errors((p) => { const { [key]: _, ...r } = p; return r; });
    }, []);

    const doRegister = useCallback(async (dir: Step3Data | null) => {
        setLoading(true);
        const success = await register(
            step1Data.nombre, step1Data.apellido, step1Data.email,
            step1Data.password, step1Data.phone || undefined,
            dir ? {
                descripcionDepartamento: dir.descripcionDepartamento,
                descripcionMunicipio:    dir.descripcionMunicipio,
                descripcionDireccion:    dir.descripcionDireccion,
                complemento:             dir.complemento  || undefined,
                descripcionBarrio:       dir.descripcionBarrio || undefined,
                codigoPostal:            dir.codigoPostal || undefined,
                etiqueta:                dir.etiqueta     || "Casa",
                telefonoContacto:        dir.telefonoContacto || undefined,
                esPrincipal:             true,
            } : undefined
        );
        setLoading(false);
        if (success) setTimeout(() => router.replace("/(tabs)/home"), 100);
        else { setStep(1); setStep1Errors({ email: "Este correo ya está registrado o hubo un error" }); }
    }, [step1Data, register, router]);

    const handleSubmit = useCallback(async () => {
        const errors = validateStep3(step3Data);
        if (Object.keys(errors).length > 0) { setStep3Errors(errors); return; }
        await doRegister(step3Data);
    }, [step3Data, doRegister]);

    const handleSkip = useCallback(() => doRegister(null), [doRegister]);

    const handleBack = useCallback(() => {
        if (step === 3) { setStep(2); return; }
        if (step === 2) { setStep(1); return; }
        if (router.canGoBack()) router.back();
        else router.replace("/(tabs)/home");
    }, [step, router]);

    return (
        <SafeAreaView style={s.root}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.orange} />
            <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <CompactHeader title="Crea tu cuenta" subtitle="Descubre el descanso perfecto" />
                    <View style={s.content}>
                        <TouchableOpacity onPress={handleBack} style={s.backBtn} accessibilityRole="button">
                            <Feather name="arrow-left" size={16} color={COLORS.text} />
                            <Text style={s.backTxt}>Volver</Text>
                        </TouchableOpacity>

                        <StepIndicator currentStep={step} steps={STEPS} />

                        {step === 1 && (
                            <RegisterStep1
                                data={step1Data} errors={step1Errors}
                                onChange={handleStep1Change}
                                onContinue={handleStep1Continue}
                                disabled={!canContinueStep1}
                            />
                        )}
                        {step === 2 && (
                            <RegisterStep2
                                data={step2Data}
                                onChange={handleStep2Change}
                                onBack={() => setStep(1)}
                                onSubmit={() => { if (canContinueStep2) setStep(3); }}
                                loading={false}
                                disabled={!canContinueStep2}
                            />
                        )}
                        {step === 3 && (
                            <RegisterStep3
                                data={step3Data} errors={step3Errors}
                                onChange={handleStep3Change}
                                onBack={() => setStep(2)}
                                onSubmit={handleSubmit}
                                loading={loading}
                                onSkip={handleSkip}
                            />
                        )}

                        <TouchableOpacity onPress={() => router.replace("/(auth)/login")} style={s.switchLink}>
                            <Text style={s.switchTxt}>
                                ¿Ya tienes cuenta?{" "}
                                <Text style={s.switchTxtBold}>Inicia sesión</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.bg },
    flex: { flex: 1 },
    scroll: { flexGrow: 1, paddingBottom: 40 },
    content: { paddingHorizontal: 20, paddingTop: 16, gap: 8 },
    backBtn: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingVertical: 6 },
    backTxt: { color: COLORS.text, fontSize: 14, fontWeight: "600" },
    switchLink: { alignItems: "center", paddingVertical: 16, marginTop: 8 },
    switchTxt: { color: COLORS.muted, fontSize: 14 },
    switchTxtBold: { color: COLORS.orange, fontWeight: "800" },
});
