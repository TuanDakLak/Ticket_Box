import { TextInput, View, StyleSheet, type TextInputProps } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { colors, radii, spacing } from '@/constants/theme';

type TextInputFieldProps = TextInputProps & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextInputField({ label, hint, error, style, ...props }: TextInputFieldProps) {
  return (
    <View style={styles.container}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        {...props}
        autoCapitalize={props.autoCapitalize ?? 'none'}
        placeholderTextColor={colors.textSoft}
        style={[styles.input, error ? styles.inputError : null, style]}
      />
      {error ? <AppText tone="danger">{error}</AppText> : hint ? <AppText tone="muted">{hint}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  input: {
    minHeight: 54,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
  },
  inputError: {
    borderColor: colors.danger,
  },
});
