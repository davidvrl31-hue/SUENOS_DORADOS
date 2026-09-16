import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants/theme";

interface StepIndicatorProps {
    currentStep: number;
    steps: string[];
}

const StepIndicator = memo(function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
    return (
        <View style={s.container}>
            {steps.map((stepLabel, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;

                return (
                    <View key={stepNumber} style={s.stepItem}>
                        <View style={s.stepHeader}>
                            <View
                                style={[
                                    s.circle,
                                    isActive && s.circleActive,
                                    isCompleted && s.circleCompleted,
                                ]}
                            >
                                <Text
                                    style={[
                                        s.circleText,
                                        (isActive || isCompleted) && s.circleTextActive,
                                    ]}
                                >
                                    {stepNumber}
                                </Text>
                            </View>
                            {index < steps.length - 1 && <View style={s.line} />}
                        </View>
                        <Text
                            style={[
                                s.stepLabel,
                                isActive && s.stepLabelActive,
                                isCompleted && s.stepLabelCompleted,
                            ]}
                        >
                            {stepLabel}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
});

export default StepIndicator;

const s = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingVertical: 16,
        paddingHorizontal: 8,
    },
    stepItem: {
        flex: 1,
        alignItems: "center",
    },
    stepHeader: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginBottom: 6,
    },
    circle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.card,
        borderWidth: 2,
        borderColor: COLORS.border,
        alignItems: "center",
        justifyContent: "center",
    },
    circleActive: {
        backgroundColor: COLORS.orange,
        borderColor: COLORS.orange,
    },
    circleCompleted: {
        backgroundColor: COLORS.green,
        borderColor: COLORS.green,
    },
    circleText: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.muted,
    },
    circleTextActive: {
        color: "#fff",
    },
    line: {
        flex: 1,
        height: 2,
        backgroundColor: COLORS.border,
        marginLeft: 4,
    },
    stepLabel: {
        fontSize: 11,
        color: COLORS.muted,
        textAlign: "center",
        fontWeight: "500",
    },
    stepLabelActive: {
        color: COLORS.orange,
        fontWeight: "700",
    },
    stepLabelCompleted: {
        color: COLORS.green,
        fontWeight: "600",
    },
});
