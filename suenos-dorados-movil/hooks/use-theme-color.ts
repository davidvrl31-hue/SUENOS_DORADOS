/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { COLORS } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const Colors = {
  light: {
    text: COLORS.text,
    background: COLORS.bg,
    tint: COLORS.orange,
    icon: COLORS.mutedDark,
    tabIconDefault: COLORS.muted,
    tabIconSelected: COLORS.orange,
  },
  dark: {
    text: COLORS.text,
    background: COLORS.bg,
    tint: COLORS.orange,
    icon: COLORS.mutedDark,
    tabIconDefault: COLORS.muted,
    tabIconSelected: COLORS.orange,
  },
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
