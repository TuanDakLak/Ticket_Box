import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthShell } from '@/components/ui/auth-shell';
import { Button } from '@/components/ui/button';
import { InlineLink } from '@/components/ui/inline-link';
import { AppText } from '@/components/ui/app-text';
import { TextInputField } from '@/components/ui/text-input-field';
import { spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { getErrorMessage } from '@/lib/errors';
import { routes } from '@/lib/routes';

export function ResetPasswordScreen() {
  const { token: tokenParam } = useLocalSearchParams<{ token?: string }>();
  const { resetPassword, isSubmitting } = useAuth();
  const [tokenValue, setTokenValue] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tokenFromLink = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam ?? '';

  useEffect(() => {
    if (tokenFromLink) {
      setTokenValue(tokenFromLink);
    }
  }, [tokenFromLink]);

  const onSubmit = async () => {
    setError(null);
    setMessage(null);

    try {
      const response = await resetPassword(tokenValue.trim(), newPassword);
      setMessage(response.message);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  };

  return (
    <AuthShell
      eyebrow="Set new password"
      title="Finish password reset"
      description="Open the reset deep link from your email, or paste the token manually if you are on another device."
      footer={
        <Link href={routes.login} asChild>
          <InlineLink label="Return to sign in" />
        </Link>
      }
    >
      <View style={styles.form}>
        <AppText tone="muted">
          Reset link for backend team:
          {'\n'}
          `ticketbox://reset-password?token=...`
        </AppText>
        <TextInputField
          label="Reset token"
          value={tokenValue}
          onChangeText={setTokenValue}
          placeholder="Paste token from email"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInputField
          label="New password"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="At least 6 characters"
          secureTextEntry
          autoComplete="new-password"
        />
        {message ? <AppText tone="success">{message}</AppText> : null}
        {error ? <AppText tone="danger">{error}</AppText> : null}
        <Button label="Update password" onPress={onSubmit} loading={isSubmitting} />
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
});
