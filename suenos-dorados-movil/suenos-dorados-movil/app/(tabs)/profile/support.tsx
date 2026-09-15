import { Feather } from "@expo/vector-icons";
import React, { memo, useCallback, useState } from "react";
import { Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ProfileScreenHeader from "../../../components/profile/ProfileScreenHeader";
import { COLORS, RADIUS } from "../../../constants/theme";

const FAQS = [
    {
        q: "¿Cuánto tarda el envío?",
        a: "El envío tarda entre 3 y 5 días hábiles según tu ciudad.",
    },
    {
        q: "¿Puedo devolver un producto?",
        a: "Sí, tienes 30 días para hacer la devolución sin costo si el producto tiene defecto de fábrica.",
    },
    {
        q: "¿Cómo hago seguimiento a mi pedido?",
        a: 'En la sección "Mis pedidos" podrás ver el estado actualizado de tu pedido.',
    },
    {
        q: "¿Qué métodos de pago aceptan?",
        a: "Aceptamos tarjetas Visa, Mastercard, PSE, Nequi y pago contra entrega.",
    },
    {
        q: "¿Tiene garantía los productos?",
        a: "Los productos tienen garantía de 6 meses por defecto de fábrica.",
    },
    {
        q: "¿Hacen envíos a todo Colombia?",
        a: "Sí, hacemos envíos a todas las ciudades principales y municipios de Colombia.",
    },
];

const SupportScreen = memo(function SupportScreen() {
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const toggleFaq = useCallback((index: number) => {
        setExpandedFaq((prev) => (prev === index ? null : index));
    }, []);

    const handleEmail = useCallback(() => {
        Linking.openURL("mailto:soporte@suenosdorados.co");
    }, []);

    const handlePhoneOrWhatsApp = useCallback(() => {
        const phoneNumber = "+573000000000";
        // En móvil: llamada directa
        // En web (si llegara a correr): WhatsApp
        if (Platform.OS === "web") {
            Linking.openURL(`https://wa.me/${phoneNumber.replace(/\+/g, "")}`);
        } else {
            const url = Platform.OS === "ios" ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`;
            Linking.openURL(url);
        }
    }, []);

    return (
        <View style={s.root}>
            <ProfileScreenHeader title="Ayuda y soporte" />
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

                {/* Contact Section */}
                <Text style={s.sectionTitle}>Contáctanos</Text>
                <View style={s.contactGrid}>
                    <TouchableOpacity style={s.contactCard} onPress={handleEmail} activeOpacity={0.7}>
                        <View style={[s.contactIcon, { backgroundColor: "#DBEAFE" }]}>
                            <Feather name="mail" size={18} color="#2563EB" />
                        </View>
                        <View style={s.contactInfo}>
                            <Text style={s.contactLabel}>Enviar un correo</Text>
                            <Text style={s.contactSub}>soporte@suenosdorados.co</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={s.contactCard} onPress={handlePhoneOrWhatsApp} activeOpacity={0.7}>
                        <View style={[s.contactIcon, { backgroundColor: COLORS.amber }]}>
                            <Feather name="phone" size={18} color={COLORS.orange} />
                        </View>
                        <View style={s.contactInfo}>
                            <Text style={s.contactLabel}>
                                {Platform.OS === "web" ? "WhatsApp" : "Llamar al soporte"}
                            </Text>
                            <Text style={s.contactSub}>+57 300 000 0000</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* FAQ Section */}
                <Text style={s.sectionTitle}>Preguntas frecuentes</Text>
                <View style={s.faqList}>
                    {FAQS.map((faq, i) => (
                        <View key={i} style={s.faqCard}>
                            <TouchableOpacity
                                style={s.faqHeader}
                                onPress={() => toggleFaq(i)}
                                activeOpacity={0.7}
                            >
                                <Text style={s.faqQuestion}>{faq.q}</Text>
                                <Feather
                                    name={expandedFaq === i ? "chevron-up" : "chevron-down"}
                                    size={18}
                                    color={expandedFaq === i ? COLORS.orange : COLORS.muted}
                                />
                            </TouchableOpacity>
                            {expandedFaq === i && (
                                <View style={s.faqAnswer}>
                                    <Text style={s.faqAnswerText}>{faq.a}</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
});

export default SupportScreen;

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.bg },
    scroll: { padding: 20, paddingBottom: 40 },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.text,
        marginBottom: 12,
        marginTop: 20,
    },
    contactGrid: {
        gap: 12,
    },
    contactCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16,
    },
    contactIcon: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.md,
        alignItems: "center",
        justifyContent: "center",
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.text,
    },
    contactSub: {
        fontSize: 12,
        color: COLORS.muted,
        marginTop: 2,
    },
    faqList: {
        gap: 8,
    },
    faqCard: {
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: "hidden",
    },
    faqHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
    },
    faqQuestion: {
        fontSize: 14,
        fontWeight: "500",
        color: COLORS.text,
        flex: 1,
        paddingRight: 16,
    },
    faqAnswer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    faqAnswerText: {
        fontSize: 13,
        color: COLORS.muted,
        lineHeight: 20,
    },
});
