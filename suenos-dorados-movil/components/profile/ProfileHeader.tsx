import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS } from "../../constants/theme";

interface ProfileHeaderProps {
    name: string;
    apellido?: string;
    email: string;
    telefono?: string | null;
    idRol?: number;
    isAuthenticated: boolean;
}

const ProfileHeader = memo(function ProfileHeader({
    name,
    apellido,
    email,
    telefono,
    idRol,
    isAuthenticated,
}: ProfileHeaderProps) {
    const initial = isAuthenticated && name ? name[0].toUpperCase() : "?";
    const displayName = isAuthenticated
        ? `${name}${apellido ? ` ${apellido}` : ""}`
        : "Invitado";
    const displayEmail = isAuthenticated ? email : "Iniciá sesión para continuar";

    return (
        <View style={s.avatarRow}>
            <View style={s.avatar}>
                <Text style={s.avatarInitial}>{initial}</Text>
            </View>
            <View style={s.flex}>
                <Text style={s.name}>{displayName}</Text>
                <Text style={s.email}>{displayEmail}</Text>
                {isAuthenticated && telefono ? (
                    <Text style={s.telefono}>{telefono}</Text>
                ) : null}
                {isAuthenticated && idRol !== undefined && (
                    <View style={s.rolBadge}>
                        <Text style={s.rolTxt}>
                            {idRol === 1 ? "Administrador" : "Cliente"}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
});

export default ProfileHeader;

const s = StyleSheet.create({
    flex: { flex: 1 },
    avatarRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16,
        marginBottom: 12,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.amber,
        borderWidth: 2,
        borderColor: COLORS.amberBorder,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarInitial: { fontSize: 24, fontWeight: "800", color: COLORS.orange },
    name: { fontSize: 17, fontWeight: "800", color: COLORS.text },
    email: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
    telefono: { fontSize: 12, color: COLORS.mutedDark, marginTop: 2 },
    rolBadge: {
        alignSelf: "flex-start",
        backgroundColor: COLORS.amber,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginTop: 6,
    },
    rolTxt: { fontSize: 10, fontWeight: "700", color: COLORS.orange },
});
