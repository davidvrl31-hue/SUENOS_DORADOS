import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import CompactHeader from "./CompactHeader";
import RegisterStep1, { Step1Data, Step1Errors } from "./RegisterStep1";
import RegisterStep2, { Step2Data } from "./RegisterStep2";
import RegisterStep3, { Step3Data, Step3Errors } from "./RegisterStep3";
import StepIndicator from "./StepIndicator";

const INITIAL_STEP1: Step1Data = {
    nombre: "",
    apellido: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
};

const INITIAL_STEP2: Step2Data = {
    acceptTerms: false,
    acceptPrivacy: false,
    acceptMarketing: false,
};

const INITIAL_STEP3: Step3Data = {
    descripcionDepartamento: "",
    descripcionMunicipio: "",
    descripcionDireccion: "",
    complemento: "",
    descripcionBarrio: "",
    codigoPostal: "",
    etiqueta: "",
    telefonoContacto: "",
};

const STEPS = ["Datos personales", "Términos legales", "Dirección de envío"];

/** Valida los datos del paso 1 */
const validateStep1 = (data: Step1Data): Step1Errors => {
    const errors: Step1Errors = {};
    if (!data.nombre.trim()) errors.nombre = "El nombre es obligatorio";
    if (!data.apellido.trim()) errors.apellido = "El apellido es obligatorio";
    if (!data.email.trim()) errors.email = "El correo es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Ingresa un correo válido";
    if (!data.password.trim()) errors.password = "La contraseña es obligatoria";
    else if (data.password.length < 6) errors.password = "Mínimo 6 caracteres";
    if (!data.confirmPassword.trim()) errors.confirmPassword = "Confirma tu contraseña";
    else if (data.password && data.confirmPassword !== data.password) errors.confirmPassword = "Las contraseñas no coinciden";
    return errors;
};

/** Valida los campos obligatorios del paso 3 (si el usuario no omite) */
const validateStep3 = (data: Step3Data): Step3Errors => {
    const errors: Step3Errors = {};
    if (!data.descripcionDepartamento.trim()) errors.descripcionDepartamento = "El departamento es obligatorio";
    if (!data.descripcionMunicipio.trim()) errors.descripcionMunicipio = "La ciudad es obligatoria";
    if (!data.descripcionDireccion.trim()) errors.descripcionDireccion = "La dirección es obligatoria";
    return errors;
};

export default function RegisterForm() {
    const router = useRouter();
    const { register } = useAuth();

    const [currentStep, setCurrentStep] = useState(1);
    const [step1Data, setStep1Data] = useState<Step1Data>(INITIAL_STEP1);
    const [step1Errors, setStep1Errors] = useState<Step1Errors>({});
    const [step2Data, setStep2Data] = useState<Step2Data>(INITIAL_STEP2);
    const [step3Data, setStep3Data] = useState<Step3Data>(INITIAL_STEP3);
    const [step3Errors, setStep3Errors] = useState<Step3Errors>({});
    const [loading, setLoading] = useState(false);

    // Reset al salir de la pantalla
    useFocusEffect(
        useCallback(() => {
            return () => {
                setCurrentStep(1);
                setStep1Data(INITIAL_STEP1);
                setStep1Errors({});
                setStep2Data(INITIAL_STEP2);
                setStep3Data(INITIAL_STEP3);
                setStep3Errors({});
                setLoading(false);
            };
        }, [])
    );

    // ── Paso 1 ────────────────────────────────────────────────────────────────

    const handleStep1Change = useCallback((key: keyof Step1Data, value: string) => {
        setStep1Data((prev) => ({ ...prev, [key]: value }));
        setStep1Errors((prev) => {
            if (prev[key]) { const { [key]: _, ...rest } = prev; return rest; }
            return prev;
        });
    }, []);

    const handleStep1Continue = useCallback(() => {
        const errors = validateStep1(step1Data);
        if (Object.keys(errors).length > 0) { setStep1Errors(errors); return; }
        setStep1Errors({});
        setCurrentStep(2);
    }, [step1Data]);

    const canContinueStep1 = useMemo(
        () => Object.keys(validateStep1(step1Data)).length === 0,
        [step1Data]
    );

    // ── Paso 2 ────────────────────────────────────────────────────────────────

    const handleStep2Change = useCallback((key: keyof Step2Data, value: boolean) => {
        setStep2Data((prev) => ({ ...prev, [key]: value }));
    }, []);

    const canContinueStep2 = useMemo(
        () => step2Data.acceptTerms && step2Data.acceptPrivacy,
        [step2Data]
    );

    const handleStep2Continue = useCallback(() => {
        if (!canContinueStep2) return;
        setCurrentStep(3);
    }, [canContinueStep2]);

    // ── Paso 3 ────────────────────────────────────────────────────────────────

    const handleStep3Change = useCallback((key: keyof Step3Data, value: string) => {
        setStep3Data((prev) => ({ ...prev, [key]: value }));
        setStep3Errors((prev) => {
            if (prev[key]) { const { [key]: _, ...rest } = prev; return rest; }
            return prev;
        });
    }, []);

    /** Enviar con dirección validada */
    const handleSubmit = useCallback(async () => {
        const errors = validateStep3(step3Data);
        if (Object.keys(errors).length > 0) { setStep3Errors(errors); return; }
        setLoading(true);
        await doRegister(step3Data);
        setLoading(false);
    }, [step3Data]); // eslint-disable-line

    /** Omitir dirección y crear cuenta sin ella */
    const handleSkip = useCallback(async () => {
        setLoading(true);
        await doRegister(null);
        setLoading(false);
    }, []); // eslint-disable-line

    const doRegister = useCallback(async (dir: Step3Data | null) => {
        const success = await register(
            step1Data.nombre,
            step1Data.apellido,
            step1Data.email,
            step1Data.password,
            step1Data.phone || undefined,
            dir
                ? {
                    descripcionDepartamento: dir.descripcionDepartamento,
                    descripcionMunicipio: dir.descripcionMunicipio,
                    descripcionDireccion: dir.descripcionDireccion,
                    complemento: dir.complemento || undefined,
                    descripcionBarrio: dir.descripcionBarrio || undefined,
                    codigoPostal: dir.codigoPostal || undefined,
                    etiqueta: dir.etiqueta || "Casa",
                    telefonoContacto: dir.telefonoContacto || undefined,
                    esPrincipal: true,
                }
                : undefined
        );

        if (success) {
            setTimeout(() => router.replace("/(tabs)/home"), 100);
        } else {
            setCurrentStep(1);
            setStep1Errors({ email: "Este correo ya está registrado o hubo un error" });
        }
    }, [step1Data, register, router]);

    // ── Navegación ────────────────────────────────────────────────────────────

    const goToLogin = useCallback(() => router.replace("/(auth)/login"), [router]);

    const handleBack = useCallback(() => {
        if (currentStep === 3) { setCurrentStep(2); return; }
        if (currentStep === 2) { setCurrentStep(1); return; }
        if (router.canGoBack()) router.back();
        else router.replace("/(tabs)/home");
    }, [currentStep, router]);

    return (
        <SafeAreaView style={s.root}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.orange} />
            <KeyboardAvoidingView
                style={s.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={s.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <CompactHeader
                        title="Crea tu cuenta"
                        subtitle="Descubre el descanso perfecto"
                    />

                    <View style={s.content}>
                        <TouchableOpacity
                            onPress={handleBack}
                            style={s.backBtn}
                            accessibilityRole="button"
                            accessibilityLabel="Volver"
                        >
                            <Feather name="arrow-left" size={16} color={COLORS.text} />
                            <Text style={s.backTxt}>Volver</Text>
                        </TouchableOpacity>

                        <StepIndicator currentStep={currentStep} steps={STEPS} />

                        {currentStep === 1 && (
                            <RegisterStep1
                                data={step1Data}
                                errors={step1Errors}
                                onChange={handleStep1Change}
                                onContinue={handleStep1Continue}
                                disabled={!canContinueStep1}
                            />
                        )}

                        {currentStep === 2 && (
                            <RegisterStep2
                                data={step2Data}
                                onChange={handleStep2Change}
                                onBack={() => setCurrentStep(1)}
                                onSubmit={handleStep2Continue}
                                loading={false}
                                disabled={!canContinueStep2}
                            />
                        )}

                        {currentStep === 3 && (
                            <RegisterStep3
                                data={step3Data}
                                errors={step3Errors}
                                onChange={handleStep3Change}
                                onBack={() => setCurrentStep(2)}
                                onSubmit={handleSubmit}
                                loading={loading}
                                onSkip={handleSkip}
                            />
                        )}

                        <TouchableOpacity
                            onPress={goToLogin}
                            style={s.switchLink}
                            accessibilityRole="link"
                        >
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
    backBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        alignSelf: "flex-start",
        paddingVertical: 6,
    },
    backTxt: { color: COLORS.text, fontSize: 14, fontWeight: "600" },
    switchLink: { alignItems: "center", paddingVertical: 16, marginTop: 8 },
    switchTxt: { color: COLORS.muted, fontSize: 14 },
    switchTxtBold: { color: COLORS.orange, fontWeight: "800" },
});
