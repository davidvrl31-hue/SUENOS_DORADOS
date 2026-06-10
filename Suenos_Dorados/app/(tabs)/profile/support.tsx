import { ScrollView, StyleSheet, View } from "react-native";
import ProfileScreenHeader from "../../../components/profile/ProfileScreenHeader";
import SupportContact from "../../../components/profile/SupportContact";
import SupportFAQ from "../../../components/profile/SupportFAQ";
import { SUPPORT_CONTACT, SUPPORT_FAQS } from "../../../constants/profile";
import { COLORS } from "../../../constants/theme";

export default function Support() {
    return (
        <View style={s.root}>
            <ProfileScreenHeader title="Ayuda y soporte" />

            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                <SupportContact items={SUPPORT_CONTACT} />
                <View style={s.spacer} />
                <SupportFAQ items={SUPPORT_FAQS} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.bg },
    scroll: { padding: 20, paddingBottom: 100 },
    spacer: { height: 28 },
});