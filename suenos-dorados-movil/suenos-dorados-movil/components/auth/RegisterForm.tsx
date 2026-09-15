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
    isAdult: false,
    acceptTerms: false,
    acceptPrivacy: false,
    acceptMarketing: false,
};

const STEPS = ["Datos personales", "Términos legales"];

/**
 * Valida los datos del paso 1
 */
const validateStep1 = (data: Step1Data): Step1Errors => {
    const errors: Step1Errors = {};
    
    if (!data.nombre.trim()) {
        errors.nombre = "El nombre es obligatorio";
    }
    
    if (!data.apellido.trim()) {
        errors.apellido = "El apellido es obligatorio";
    }
    
    if (!data.email.trim()) {
        errors.email = "El correo es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = "Ingresa un correo válido";
    }
    
    if (!data.password.trim()) {
        errors.password = "La contraseña es obligatoria";
    } else if (data.password.length < 6) {
        errors.password = "Mínimo 6 caracteres";
    }
    
    if (!data.confirmPassword.trim()) {
        errors.confirmPassword = "Confirma tu contraseña";
    } else if (data.password && data.confirmPassword !== data.password) {
        errors.confirmPassword = "Las contraseñas no coinciden";
    }
    
    return errors;
};

export default function RegisterForm() {
    const router = useRouter();
    const { register } = useAuth();
    
    const [currentStep, setCurrentStep] = useState(1);
    const [step1Data, setStep1Data] = useState<Step1Data>(INITIAL_STEP1);
    const [step1Errors, setStep1Errors] = useState<Step1Errors>({});
    const [step2Data, setStep2Data] = useState<Step2Data>(INITIAL_STEP2);
    const [loading, setLoading] = useState(false);

    // Reset al desmontar o salir de la pantalla
    useFocusEffect(
        useCallback(() => {
            return () => {
                setCurrentStep(1);
                setStep1Data(INITIAL_STEP1);
                setStep1Errors({});
                setStep2Data(INITIAL_STEP2);
                setLoading(false);
            };
        }, [])
    );

    // ── Paso 1 ────────────────────────────────────────────────────────────────

    const handleStep1Change = useCallback((key: keyof Step1Data, value: string) => {
        setStep1Data((prev) => ({ ...prev, [key]: value }));
        // Limpiar error del campo al editar
        setStep1Errors((prev) => {
            if (prev[key]) {
                const { [key]: _, ...rest } = prev;
                return rest;
            }
            return prev;
        });
    }, []);

    const handleStep1Continue = useCallback(() => {
        const errors = validateStep1(step1Data);
        if (Object.keys(errors).length > 0) {
            setStep1Errors(errors);
            return;
        }
        setStep1Errors({});
        setCurrentStep(2);
    }, [step1Data]);

    const canContinueStep1 = useMemo(() => {
        const errors = validateStep1(step1Data);
        return Object.keys(errors).length === 0;
    }, [step1Data]);

    // ── Paso 2 ────────────────────────────────────────────────────────────────

    const handleStep2Change = useCallback((key: keyof Step2Data, value: boolean) => {
        setStep2Data((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleStep2Back = useCallback(() => {
        setCurrentStep(1);
    }, []);

    const canSubmit = useMemo(() => {
        return (
            step2Data.isAdult &&
            step2Data.acceptTerms &&
            step2Data.acceptPrivacy
        );
    }, [step2Data]);

    const handleSubmit = useCallback(async () => {
        if (!canSubmit) return;

        setLoading(true);
        const success = await register(
            step1Data.nombre,
            step1Data.apellido,
            step1Data.email,
            step1Data.password,
            step1Data.phone || undefined
        );
        setLoading(false);

        if (success) {
            // Pequeño delay para que el Root Layout esté montado antes de navegar
            setTimeout(() => router.replace("/(tabs)/home"), 100);
        } else {
            // Volver al paso 1 y mostrar error
            setCurrentStep(1);
            setStep1Errors({ 
                email: "Este correo ya está registrado o hubo un error" 
            });
        }
    }, [canSubmit, register, step1Data, router]);

    // ── Navegación ────────────────────────────────────────────────────────────

    const goToLogin = useCallback(() => {
        router.replace("/(auth)/login");
    }, [router]);

    const handleBack = useCallback(() => {
        if (currentStep === 2) {
            setCurrentStep(1);
        } else if (router.canGoBack()) {
            router.back();
        } else {
            router.replace("/(tabs)/home");
        }
    }, [currentStep, router]);

    return (
        <SafeAreaView style={s.root}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.orange} />
            <KeyboardAvoidingView
                style={s.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                <ScrollView
                    contentContainerStyle={s.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header compacto */}
                    <CompactHeader
                        title="Crea tu cuenta"
                        subtitle="Descubre el descanso perfecto"
                    />

                    {/* Contenido del formulario */}
                    <View style={s.content}>
                        {/* Botón volver */}
                        <TouchableOpacity
                            onPress={handleBack}
                            style={s.backBtn}
                            accessibilityRole="button"
                            accessibilityLabel="Volver"
                        >
                            <Feather name="arrow-left" size={16} color={COLORS.text} />
                            <Text style={s.backTxt}>Volver</Text>
                        </TouchableOpacity>

                        {/* Indicador de pasos */}
                        <StepIndicator currentStep={currentStep} steps={STEPS} />

                        {/* Paso 1: Datos personales */}
                        {currentStep === 1 && (
                            <RegisterStep1
                                data={step1Data}
                                errors={step1Errors}
                                onChange={handleStep1Change}
                                onContinue={handleStep1Continue}
                                disabled={!canContinueStep1}
                            />
                        )}

                        {/* Paso 2: Términos legales */}
                        {currentStep === 2 && (
                            <RegisterStep2
                                data={step2Data}
                                onChange={handleStep2Change}
                                onBack={handleStep2Back}
                                onSubmit={handleSubmit}
                                loading={loading}
                                disabled={!canSubmit}
                            />
                        )}

                        {/* Link a login */}
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
    root: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    flex: {
        flex: 1,
    },
    scroll: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 16,
        gap: 8,
    },
    backBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        alignSelf: "flex-start",
        paddingVertical: 6,
    },
    backTxt: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: "600",
    },
    switchLink: {
        alignItems: "center",
        paddingVertical: 16,
        marginTop: 8,
    },
    switchTxt: {
        color: COLORS.muted,
        fontSize: 14,
    },
    switchTxtBold: {
        color: COLORS.orange,
        fontWeight: "800",
    },
});
