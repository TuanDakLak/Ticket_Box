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

export function LoginScreen() {
  const router = useRouter();
  const { login, isSubmitting } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);

    try {
      const nextRoute = await login(email.trim(), password);
      router.replace(nextRoute);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  };

  return (
    <AuthShell
      eyebrow="Staff access"
      title="Sign in to TicketBox"
      description="Use your TicketBox account to enter the staff workspace and event operations tools."
      footer={
        <View style={styles.footerLinks}>
          <Link href={routes.register} asChild>
            <InlineLink label="Create account" />
          </Link>
          <Link href={routes.resendVerification} asChild>
            <InlineLink label="Resend verification" />
          </Link>
        </View>
      }
    >
      <View style={styles.form}>
        <TextInputField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="staff@ticketbox.vn"
          keyboardType="email-address"
          autoComplete="email"
        />
        <TextInputField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          autoComplete="password"
        />
        {error ? <AppText tone="danger">{error}</AppText> : null}
        <Button label="Sign in" onPress={onSubmit} loading={isSubmitting} />
        <Link href={routes.forgotPassword} asChild>
          <InlineLink label="Forgot password?" />
        </Link>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
});
