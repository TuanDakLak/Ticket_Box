import { StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/ui/app-screen';
import { AppText } from '@/components/ui/app-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { colors, spacing } from '@/constants/theme';

export function ScannerPlaceholderScreen() {
  return (
    <AppScreen scroll={false}>
      <View style={styles.container}>
        <View style={styles.placeholder} />
        <SurfaceCard>
          <AppText variant="subtitle">Scanner placeholder</AppText>
          <AppText tone="muted">
            Camera-based ticket scanning is intentionally not implemented yet. This screen reserves the route and visual entry point for the future check-in flow.
          </AppText>
        </SurfaceCard>
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
  placeholder: {
    height: 280,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});
