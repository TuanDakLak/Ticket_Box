import { type PropsWithChildren, type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

import { AppScreen } from '@/components/ui/app-screen';
import { AppText } from '@/components/ui/app-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { colors, radii, spacing } from '@/constants/theme';

type AuthShellProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  footer?: ReactNode;
}>;

export function AuthShell({ eyebrow, title, description, footer, children }: AuthShellProps) {
  return (
    <AppScreen>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.badge}>
            <AppText variant="caption" tone="primary">
              {eyebrow}
            </AppText>
          </View>
          <AppText variant="title">{title}</AppText>
          <AppText tone="muted">{description}</AppText>
        </View>

        <SurfaceCard>{children}</SurfaceCard>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
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
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    backgroundColor: colors.backgroundMuted,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  footer: {
    gap: spacing.sm,
  },
});
