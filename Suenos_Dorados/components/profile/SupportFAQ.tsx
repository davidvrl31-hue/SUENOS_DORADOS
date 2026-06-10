import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { FAQItem } from "../../constants/profile";
import { COLORS, RADIUS } from "../../constants/theme";

interface SupportFAQProps {
    items: FAQItem[];
}

export default function SupportFAQ({ items }: SupportFAQProps) {
    return (
        <View>
            <Text style={s.sectionTitle}>Preguntas frecuentes</Text>
            <View style={s.card}>
                {items.map((faq, i) => (
                    <View key={i} style={[s.item, i < items.length - 1 && s.border]}>
                        <View style={s.question}>
                            <Feather
                                name="help-circle"
                                size={16}
                                color={COLORS.orange}
                                style={{ marginTop: 1 }}
                            />
                            <Text style={s.questionTxt}>{faq.q}</Text>
                        </View>
                        <Text style={s.answer}>{faq.a}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    sectionTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: COLORS.text,
        marginBottom: 12,
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: "hidden",
    },
    item: {
        padding: 16,
    },
    border: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    question: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        marginBottom: 6,
    },
    questionTxt: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.text,
        flex: 1,
        lineHeight: 20,
    },
    answer: {
        fontSize: 13,
        color: COLORS.muted,
        lineHeight: 19,
        paddingLeft: 24,
    },
});
