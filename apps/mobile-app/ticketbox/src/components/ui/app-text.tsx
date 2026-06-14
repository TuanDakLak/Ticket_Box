import { Text, StyleSheet, type TextProps } from 'react-native';

import { colors } from '@/constants/theme';

type AppTextProps = TextProps & {
  variant?: 'title' | 'subtitle' | 'body' | 'caption' | 'label';
  tone?: 'default' | 'muted' | 'primary' | 'danger' | 'success';
};

export function AppText({ style, variant = 'body', tone = 'default', ...props }: AppTextProps) {
  return <Text {...props} style={[styles.base, variants[variant], tones[tone], style]} />;
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
  },
});

const variants = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    lineHeight: 19,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});

const tones = StyleSheet.create({
  default: { color: colors.text },
  muted: { color: colors.textMuted },
  primary: { color: colors.primary },
  danger: { color: colors.danger },
  success: { color: colors.success },
});
