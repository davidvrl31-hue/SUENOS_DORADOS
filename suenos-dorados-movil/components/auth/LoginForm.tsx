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

type FormData = { email: string; password: string };
type Errors = Partial<Record<keyof FormData, string>>;

const INITIAL_FORM: FormData = { email: "", password: "" };

const validate = (data: FormData): Errors => {
  const errors: Errors = {};
  if (!data.email.trim()) errors.email = "Ingresá tu correo";
  if (!data.password.trim()) errors.password = "Ingresá tu contraseña";
  return errors;
};

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setForm(INITIAL_FORM);
        setErrors({});
        setLoading(false);
      };
    }, []),
  );

  const handleChange = useCallback((key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }, []);

  const toggleShowPass = useCallback(() => setShowPass((v) => !v), []);
  const toggleRemember = useCallback(() => setRemember((v) => !v), []);

  const handleSubmit = useCallback(async () => {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    const success = await login(form.email, form.password);
    setLoading(false);
    if (success) {
      setTimeout(() => router.replace("/(tabs)/home"), 100);
    } else {
      setErrors({ email: "Correo o contraseña incorrectos" });
    }
  }, [form, login, router]);
  const goToRegister = useCallback(
    () => router.replace("/(auth)/register"),
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
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthFormHeader
            title="Bienvenido de nuevo"
            subtitle="Iniciá sesión para continuar"
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

            {/* Email */}
            <View>
              <Text style={s.fieldLabel}>Correo electrónico</Text>
              <View style={[s.inputWrap, errors.email && s.inputError]}>
                <Feather name="mail" size={16} color={COLORS.mutedDark} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  placeholder="tu@correo.com"
                  placeholderTextColor={COLORS.mutedDark}
                  value={form.email}
                  onChangeText={(v) => handleChange("email", v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Correo electrónico"
                />
              </View>
              {errors.email && <Text style={s.errorTxt}>{errors.email}</Text>}
            </View>

            {/* Contraseña */}
            <View>
              <View style={s.labelRow}>
                <Text style={s.fieldLabel}>Contraseña</Text>
                <TouchableOpacity accessibilityRole="button">
                  <Text style={s.forgotTxt}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>
              </View>
              <View style={[s.inputWrap, errors.password && s.inputError]}>
                <Feather name="lock" size={16} color={COLORS.mutedDark} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  placeholder="Tu contraseña"
                  placeholderTextColor={COLORS.mutedDark}
                  value={form.password}
                  onChangeText={(v) => handleChange("password", v)}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Contraseña"
                />
                <TouchableOpacity
                  onPress={toggleShowPass}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  accessibilityRole="button"
                >
                  <Feather name={showPass ? "eye" : "eye-off"} size={18} color={COLORS.mutedDark} />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={s.errorTxt}>{errors.password}</Text>}
            </View>

            {/* Recordarme */}
            <TouchableOpacity
              onPress={toggleRemember}
              activeOpacity={0.7}
              style={s.checkRow}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: remember }}
            >
              <View style={[s.checkbox, remember && s.checkboxActive]}>
                {remember && <Feather name="check" size={12} color="#fff" />}
              </View>
              <Text style={s.checkLabel}>Recordar mi sesión</Text>
            </TouchableOpacity>

            {/* Botón */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
              style={[s.submitBtn, loading && s.submitBtnLoading]}
              accessibilityRole="button"
              accessibilityLabel="Iniciar sesión"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.submitTxt}>Iniciar sesión</Text>
              )}
            </TouchableOpacity>

            {/* Ir a registro */}
            <TouchableOpacity
              onPress={goToRegister}
              style={s.switchLink}
              accessibilityRole="link"
            >
              <Text style={s.switchTxt}>
                ¿No tenés cuenta?{" "}
                <Text style={s.switchTxtBold}>Registrate</Text>
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
  form: { paddingHorizontal: 20, paddingTop: 28, gap: 16 },
  fieldLabel: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  forgotTxt: { color: COLORS.orange, fontSize: 12, fontWeight: "700" },
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
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 48, fontSize: 15, color: COLORS.text },
  errorTxt: { color: COLORS.red, fontSize: 12, marginTop: 4, marginLeft: 4 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.mutedDark,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: { backgroundColor: COLORS.orange, borderColor: COLORS.orange },
  checkLabel: { color: COLORS.muted, fontSize: 13 },
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
