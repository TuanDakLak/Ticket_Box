import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/ui/app-screen';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { SurfaceCard } from '@/components/ui/surface-card';
import { TextInputField } from '@/components/ui/text-input-field';
import { spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { getErrorMessage } from '@/lib/errors';

export function ProfileScreen() {
  const { user, logout, changePassword, isSubmitting } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onChangePassword = async () => {
    setError(null);
    setMessage(null);

    try {
      const response = await changePassword(oldPassword, newPassword);
      setMessage(response.message);
      setOldPassword('');
      setNewPassword('');
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  };

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
          <AppText variant="subtitle">Change password</AppText>
          <TextInputField
            label="Current password"
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="Enter current password"
            secureTextEntry
          />
          <TextInputField
            label="New password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            secureTextEntry
          />
          {message ? <AppText tone="success">{message}</AppText> : null}
          {error ? <AppText tone="danger">{error}</AppText> : null}
          <Button label="Update password" onPress={onChangePassword} loading={isSubmitting} />
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
