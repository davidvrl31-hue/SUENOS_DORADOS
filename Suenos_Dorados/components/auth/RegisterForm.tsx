import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import AuthFormHeader from "./AuthFormHeader";

type FormData = {
  nombre: string;
  apellido: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};
type Errors = Partial<Record<keyof FormData, string>>;

const INITIAL_FORM: FormData = {
  nombre: "",
  apellido: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const validate = (data: FormData): Errors => {
  const errors: Errors = {};
  if (!data.nombre.trim()) errors.nombre = "El nombre es obligatorio";
  if (!data.apellido.trim()) errors.apellido = "El apellido es obligatorio";
  if (!data.email.trim()) errors.email = "El correo es obligatorio";
  if (!data.password.trim()) errors.password = "La contraseña es obligatoria";
  else if (data.password.length < 6) errors.password = "Mínimo 6 caracteres";
  if (!data.confirmPassword.trim())
    errors.confirmPassword = "Confirmá tu contraseña";
  if (
    data.password.trim() &&
    data.confirmPassword.trim() &&
    data.password !== data.confirmPassword
  )
    errors.confirmPassword = "Las contraseñas no coinciden";
  return errors;
};

type FieldConfig = {
  key: keyof FormData;
  label: string;
  placeholder: string;
  keyboard?: "default" | "email-address" | "phone-pad";
  secure?: boolean;
  capitalize?: "none" | "words";
};

const FIELDS: FieldConfig[] = [
  { key: "nombre", label: "Nombre", placeholder: "Juan", capitalize: "words" },
  { key: "apellido", label: "Apellido", placeholder: "García", capitalize: "words" },
  {
    key: "email",
    label: "Correo electrónico",
    placeholder: "tu@correo.com",
    keyboard: "email-address",
    capitalize: "none",
  },
  { key: "phone", label: "Teléfono (opcional)", placeholder: "+57 300 000 0000", keyboard: "phone-pad" },
  {
    key: "password",
    label: "Contraseña",
    placeholder: "Mínimo 6 caracteres",
    secure: true,
    capitalize: "none",
  },
  {
    key: "confirmPassword",
    label: "Confirmar contraseña",
    placeholder: "Repite tu contraseña",
    secure: true,
    capitalize: "none",
  },
];

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [showFields, setShowFields] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setForm(INITIAL_FORM);
        setErrors({});
        setAccepted(false);
        setLoading(false);
      };
    }, []),
  );

  const handleChange = useCallback((key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }, []);

  const toggleShow = useCallback((key: keyof FormData) => {
    setShowFields((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleAccepted = useCallback(() => setAccepted((v) => !v), []);

  const handleSubmit = useCallback(async () => {
    const validationErrors = validate(form);
    if (!accepted) {
      validationErrors.nombre =
        validationErrors.nombre ?? "Acepta los términos para continuar";
    }
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    const success = await register(
      form.nombre,
      form.apellido,
      form.email,
      form.password,
      form.phone || undefined
    );
    setLoading(false);
    if (success) {
      // Pequeño delay para que el Root Layout esté montado antes de navegar
      setTimeout(() => router.replace("/(tabs)/home"), 100);
    } else {
      setErrors({ email: "Este correo ya está registrado o hubo un error" });
    }
  }, [form, accepted, register, router]);

  const goToLogin = useCallback(
    () => router.replace("/(auth)/login"),
    [router],
  );

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/home");
  }, [router]);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.orange} />
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthFormHeader
            title="Crea tu cuenta"
            subtitle="Descubre el descanso perfecto"
          />

          <View style={s.form}>
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

            {FIELDS.map((field) => (
              <View key={field.key}>
                <Text style={s.fieldLabel}>{field.label}</Text>
                <View style={[s.inputWrap, errors[field.key] && s.inputError]}>
                  <TextInput
                    style={s.input}
                    placeholder={field.placeholder}
                    placeholderTextColor={COLORS.mutedDark}
                    value={form[field.key]}
                    onChangeText={(v) => handleChange(field.key, v)}
                    secureTextEntry={field.secure && !showFields[field.key]}
                    keyboardType={field.keyboard ?? "default"}
                    autoCapitalize={field.capitalize ?? "none"}
                    autoCorrect={false}
                    accessibilityLabel={field.label}
                  />
                  {field.secure && (
                    <TouchableOpacity
                      onPress={() => toggleShow(field.key)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel={showFields[field.key] ? "Ocultar" : "Mostrar"}
                      accessibilityRole="button"
                    >
                      <Feather
                        name={showFields[field.key] ? "eye" : "eye-off"}
                        size={18}
                        color={COLORS.mutedDark}
                      />
                    </TouchableOpacity>
                  )}
                </View>
                {errors[field.key] && (
                  <Text style={s.errorTxt}>{errors[field.key]}</Text>
                )}
              </View>
            ))}

            {/* Términos */}
            <TouchableOpacity
              onPress={toggleAccepted}
              activeOpacity={0.7}
              style={s.checkRow}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: accepted }}
            >
              <View style={[s.checkbox, accepted && s.checkboxActive]}>
                {accepted && <Feather name="check" size={12} color="#fff" />}
              </View>
              <Text style={s.checkLabel}>
                Acepto los{" "}
                <Text style={s.linkTxt}>Términos de uso</Text>
                {" "}y la{" "}
                <Text style={s.linkTxt}>Política de privacidad</Text>
              </Text>
            </TouchableOpacity>

            {/* Botón */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
              style={[s.submitBtn, loading && s.submitBtnLoading]}
              accessibilityRole="button"
              accessibilityLabel="Crear cuenta"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.submitTxt}>Crear cuenta</Text>
              )}
            </TouchableOpacity>

            {/* Ir a login */}
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
  scroll: { flexGrow: 1, paddingBottom: 60 },
  form: { paddingHorizontal: 20, paddingTop: 24, gap: 14 },
  fieldLabel: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  inputError: { borderColor: COLORS.red },
  input: { flex: 1, height: 48, fontSize: 15, color: COLORS.text },
  errorTxt: { color: COLORS.red, fontSize: 12, marginTop: 4, marginLeft: 4 },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    marginTop: 1,
    borderWidth: 2,
    borderColor: COLORS.mutedDark,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: { backgroundColor: COLORS.orange, borderColor: COLORS.orange },
  checkLabel: { flex: 1, color: COLORS.muted, fontSize: 13, lineHeight: 20 },
  linkTxt: { color: COLORS.orange, fontWeight: "700" },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingVertical: 4,
    marginBottom: 4,
  },
  backTxt: { color: COLORS.text, fontSize: 14, fontWeight: "600" },
  submitBtn: {
    height: 52,
    borderRadius: 16,
    marginTop: 4,
    backgroundColor: COLORS.orange,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  submitBtnLoading: { backgroundColor: "#e09030" },
  submitTxt: { color: "#fff", fontSize: 16, fontWeight: "800", letterSpacing: 0.5 },
  switchLink: { alignItems: "center", paddingVertical: 8 },
  switchTxt: { color: COLORS.muted, fontSize: 14 },
  switchTxtBold: { color: COLORS.orange, fontWeight: "800" },
});
