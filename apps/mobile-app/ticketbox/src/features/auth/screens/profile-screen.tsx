import { StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/ui/app-screen';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { SurfaceCard } from '@/components/ui/surface-card';
import { spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function ProfileScreen() {
  const { user, logout, isSubmitting } = useAuth();

  return (
    <AppScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <AppText variant="title">Profile</AppText>
          <AppText tone="muted">Review the signed-in account and test protected account actions.</AppText>
        </View>

        <SurfaceCard>
          <AppText variant="subtitle">{user?.fullName}</AppText>
          <AppText tone="muted">{user?.email}</AppText>
          <AppText tone="muted">Roles: {(user?.roles ?? []).join(', ')}</AppText>
          <AppText tone="muted">
            Permissions: {user?.permissions?.length ? user.permissions.join(', ') : 'None returned'}
          </AppText>
        </SurfaceCard>

        <SurfaceCard>
          <AppText variant="subtitle">Account policy</AppText>
          <AppText tone="muted">
            Checker and admin accounts are issued by TicketBox. If you need a password reset or role update, contact the system administrator.
          </AppText>
        </SurfaceCard>

        <Button label="Sign out" onPress={logout} variant="danger" loading={isSubmitting} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  header: {
    gap: spacing.xs,
  },
});
