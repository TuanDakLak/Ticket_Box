export function isAudienceOnly(roles: string[] = []) {
  return roles.length > 0 && roles.every((role) => role === 'Audience');
}

export function isStaffOrAdmin(roles: string[] = []) {
  return roles.some((role) => role === 'Staff' || role === 'Admin');
}
