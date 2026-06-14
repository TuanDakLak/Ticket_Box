import { Redirect, Slot } from 'expo-router';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { isStaffOrAdmin } from '@/features/auth/utils/role-helpers';
import { routes } from '@/lib/routes';

export default function StaffLayout() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href={routes.login} />;
  }

  if (!user || !isStaffOrAdmin(user.roles)) {
    return <Redirect href={routes.pendingApproval} />;
  }

  return <Slot />;
}
