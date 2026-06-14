import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthShell } from '@/components/ui/auth-shell';
import { Button } from '@/components/ui/button';
import { InlineLink } from '@/components/ui/inline-link';
import { AppText } from '@/components/ui/app-text';
import { TextInputField } from '@/components/ui/text-input-field';
import { DEEP_LINKS } from '@/constants/deep-links';
import { spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { getErrorMessage } from '@/lib/errors';
import { routes } from '@/lib/routes';

export function ForgotPasswordScreen() {
  const { forgotPassword, isSubmitting } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setMessage(null);

    try {
      const response = await forgotPassword(email.trim());
      setMessage(response.message);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  };

  return (
    <AuthShell
      eyebrow="Password recovery"
      title="Reset your password"
      description="We’ll ask the backend to send a reset link to your email. Use the token from that email on the next screen."
      footer={
        <Link href={routes.login} asChild>
          <InlineLink label="Back to sign in" />
        </Link>
      }
    >
      <View style={styles.form}>
        <AppText tone="muted">
          Suggested email deep link:
          {'\n'}
          `{DEEP_LINKS.resetPassword}`
        </AppText>
        <TextInputField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoComplete="email"
        />
        {message ? <AppText tone="success">{message}</AppText> : null}
        {error ? <AppText tone="danger">{error}</AppText> : null}
        <Button label="Send reset email" onPress={onSubmit} loading={isSubmitting} />
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
});
