import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ContactItem } from "../../constants/profile";
import { COLORS, RADIUS } from "../../constants/theme";

interface SupportContactProps {
    items: ContactItem[];
}

export default function SupportContact({ items }: SupportContactProps) {
    return (
        <View>
            <Text style={s.sectionTitle}>Contáctanos</Text>
            <View style={s.card}>
                {items.map((item, i) => (
                    <TouchableOpacity
                        key={item.label}
                        style={[s.row, i < items.length - 1 && s.border]}
                        onPress={item.action}
                        activeOpacity={0.7}
                    >
                        <View style={s.iconBox}>
                            <Feather name={item.icon} size={18} color={COLORS.orange} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.label}>{item.label}</Text>
                            <Text style={s.sub}>{item.sub}</Text>
                        </View>
                        <Feather name="chevron-right" size={16} color={COLORS.mutedDark} />
                    </TouchableOpacity>
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
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        padding: 16,
    },
    border: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.amber,
        alignItems: "center",
        justifyContent: "center",
    },
    label: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.text,
    },
    sub: {
        fontSize: 12,
        color: COLORS.muted,
        marginTop: 2,
    },
});
