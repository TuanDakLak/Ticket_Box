import { StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/ui/app-screen';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { SurfaceCard } from '@/components/ui/surface-card';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function PendingApprovalScreen() {
  const { user, logout, isSubmitting } = useAuth();

  return (
    <AppScreen scroll={false}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.dot} />
          <AppText variant="title">Pending staff permission</AppText>
          <AppText tone="muted">
            {user?.fullName ?? 'Your account'} is signed in, but staff-only tools are still locked for audience access.
          </AppText>
        </View>

        <SurfaceCard>
          <AppText variant="subtitle">What happens next</AppText>
          <AppText tone="muted">
            This mobile app only allows Checker and Admin accounts. Ask TicketBox to assign the correct role to your account before signing in again.
          </AppText>
          <AppText tone="muted">Current roles: {(user?.roles ?? []).join(', ') || 'Audience'}</AppText>
        </SurfaceCard>

        <View style={styles.actions}>
          <Button label="Checker role required" onPress={() => {}} variant="secondary" disabled />
          <Button label="Sign out" onPress={logout} loading={isSubmitting} />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  hero: {
    gap: spacing.sm,
  },
  dot: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.warning,
  },
  actions: {
    gap: spacing.md,
  },
});
