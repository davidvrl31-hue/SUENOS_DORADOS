import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants/theme";

export default function PromoBanner() {
  return (
    <View style={s.banner}>
      <View style={s.icon}>
        <Feather name="truck" size={22} color={COLORS.orange} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.title}>Envío gratis a toda Colombia</Text>
        <Text style={s.sub}>En compras mayores a $100.000 COP</Text>
      </View>
      <Feather name="chevron-right" size={16} color={COLORS.muted} />
    </View>
  );
}

const s = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 20,
    marginBottom: 28,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.amber,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 14, fontWeight: "700", color: COLORS.text, marginBottom: 2 },
  sub: { fontSize: 12, color: COLORS.muted },
});