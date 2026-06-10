import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, RADIUS } from "../../constants/theme";

interface ProfileScreenHeaderProps {
    title: string;
    onBack?: () => void;
    rightButton?: {
        icon: React.ComponentProps<typeof Feather>["name"];
        onPress: () => void;
        variant?: "primary" | "default";
    };
}

export default function ProfileScreenHeader({
    title,
    onBack,
    rightButton,
}: ProfileScreenHeaderProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={handleBack}>
                <Feather name="arrow-left" size={20} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={s.title}>{title}</Text>
            {rightButton ? (
                <TouchableOpacity
                    style={[
                        s.rightBtn,
                        rightButton.variant === "primary" && s.rightBtnPrimary,
                    ]}
                    onPress={rightButton.onPress}
                >
                    <Feather
                        name={rightButton.icon}
                        size={20}
                        color={rightButton.variant === "primary" ? COLORS.orange : COLORS.text}
                    />
                </TouchableOpacity>
            ) : (
                <View style={{ width: 40 }} />
            )}
        </View>
    );
}

const s = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 52,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.bg,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 17,
        fontWeight: "800",
        color: COLORS.text,
    },
    rightBtn: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
        justifyContent: "center",
    },
    rightBtnPrimary: {
        backgroundColor: COLORS.amber,
        borderColor: COLORS.amberBorder,
    },
});
