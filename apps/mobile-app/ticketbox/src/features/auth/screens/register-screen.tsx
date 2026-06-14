import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
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

export function RegisterScreen() {
  const router = useRouter();
  const { register, isSubmitting } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setMessage(null);

    try {
      const response = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      setMessage(
        response.status === 'PENDING'
          ? 'Account created. Verify your email first, then wait for staff permission if needed.'
          : 'Account created successfully. You can sign in now.',
      );
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  };

  return (
    <AuthShell
      eyebrow="New account"
      title="Create a TicketBox account"
      description="New users start as Audience. After email verification, staff and admin access can be granted later."
      footer={
        <Link href={routes.login} asChild>
          <InlineLink label="Back to sign in" />
        </Link>
      }
    >
      <View style={styles.form}>
        <TextInputField
          label="Full name"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Nguyen Van A"
          autoCapitalize="words"
          autoComplete="name"
        />
        <TextInputField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoComplete="email"
        />
        <TextInputField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          secureTextEntry
          autoComplete="new-password"
        />
        {message ? <AppText tone="success">{message}</AppText> : null}
        {error ? <AppText tone="danger">{error}</AppText> : null}
        <Button label="Create account" onPress={onSubmit} loading={isSubmitting} />
        <Button label="Continue to sign in" onPress={() => router.replace(routes.login)} variant="secondary" />
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
});
