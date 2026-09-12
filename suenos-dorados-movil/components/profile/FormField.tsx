import { StyleSheet, Text, TextInput, View } from "react-native";
import { COLORS } from "../../constants/theme";

interface FormFieldProps {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    multiline?: boolean;
    keyboardType?: "default" | "phone-pad" | "email-address" | "numeric";
}

export default function FormField({
    label,
    placeholder,
    value,
    onChangeText,
    multiline,
    keyboardType = "default",
}: FormFieldProps) {
    return (
        <View style={s.wrap}>
            <Text style={s.label}>{label}</Text>
            <TextInput
                style={[s.input, multiline && s.inputMultiline]}
                placeholder={placeholder}
                placeholderTextColor={COLORS.mutedDark}
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
                keyboardType={keyboardType}
            />
        </View>
    );
}

const s = StyleSheet.create({
    wrap: {
        marginBottom: 14,
    },
    label: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.text,
        marginBottom: 6,
    },
    input: {
        backgroundColor: COLORS.bg,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: COLORS.text,
    },
    inputMultiline: {
        height: 72,
        textAlignVertical: "top",
    },
});
