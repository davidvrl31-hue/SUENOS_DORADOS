import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/theme";

interface FormToggleProps {
    label: string;
    value: boolean;
    onToggle: () => void;
}

export default function FormToggle({ label, value, onToggle }: FormToggleProps) {
    return (
        <TouchableOpacity style={s.toggle} onPress={onToggle}>
            <View style={[s.box, value && s.boxActive]}>
                {value && <Feather name="check" size={12} color="#fff" />}
            </View>
            <Text style={s.label}>{label}</Text>
        </TouchableOpacity>
    );
}

const s = StyleSheet.create({
    toggle: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 20,
    },
    box: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: COLORS.border,
        alignItems: "center",
        justifyContent: "center",
    },
    boxActive: {
        backgroundColor: COLORS.orange,
        borderColor: COLORS.orange,
    },
    label: {
        fontSize: 13,
        color: COLORS.text,
        fontWeight: "500",
    },
});
