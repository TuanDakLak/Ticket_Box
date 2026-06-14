import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/ui/app-screen';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { SurfaceCard } from '@/components/ui/surface-card';
import { spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { routes } from '@/lib/routes';

export function StaffHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <AppScreen>
      <View style={styles.container}>
        <View style={styles.hero}>
          <AppText variant="caption" tone="primary">
            CHECKER AREA
          </AppText>
          <AppText variant="title">Welcome back, {user?.fullName?.split(' ')[0] ?? 'staff'}.</AppText>
          <AppText tone="muted">
            This is the scaffolded staff entry point for TicketBox event operations. Check-in and scanner workflows can plug in here next.
          </AppText>
        </View>

        <SurfaceCard>
          <AppText variant="subtitle">Current access</AppText>
          <AppText tone="muted">Roles: {(user?.roles ?? []).join(', ')}</AppText>
          <AppText tone="muted">
            Permissions: {user?.permissions?.length ? user.permissions.join(', ') : 'No explicit permissions returned.'}
          </AppText>
        </SurfaceCard>

        <View style={styles.actions}>
          <Button label="Open scanner placeholder" onPress={() => router.push(routes.staffScanner)} />
          <Button label="View profile" onPress={() => router.push(routes.staffProfile)} variant="secondary" />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  hero: {
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.md,
  },
});
