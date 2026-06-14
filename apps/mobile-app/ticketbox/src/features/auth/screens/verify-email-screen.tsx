import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthShell } from '@/components/ui/auth-shell';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { InlineLink } from '@/components/ui/inline-link';
import { spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { getErrorMessage } from '@/lib/errors';
import { routes } from '@/lib/routes';

export function VerifyEmailScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { verifyEmail, isSubmitting } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tokenValue = Array.isArray(token) ? token[0] : token ?? '';

  const onVerify = async () => {
    if (!tokenValue) {
      setError('Missing verification token.');
      return;
    }

    setError(null);
    setMessage(null);

    try {
      const response = await verifyEmail(tokenValue);
      setMessage(response.message ?? 'Email verified successfully. You can sign in now.');
    } catch (verifyError) {
      setError(getErrorMessage(verifyError));
    }
  };

  useEffect(() => {
    if (tokenValue) {
      onVerify();
    }
  }, [tokenValue]);

  return (
    <AuthShell
      eyebrow="Email verification"
      title="Verify your TicketBox account"
      description="This screen supports the email verification deep link from the backend auth module."
      footer={
        <Link href={routes.login} asChild>
          <InlineLink label="Back to sign in" />
        </Link>
      }
    >
      <View style={styles.form}>
        <AppText tone="muted">
          Verification link for backend team:
          {'\n'}
          `ticketbox://verify?token=...`
        </AppText>
        {message ? <AppText tone="success">{message}</AppText> : null}
        {error ? <AppText tone="danger">{error}</AppText> : null}
        <Button label="Verify again" onPress={onVerify} loading={isSubmitting} />
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
});
