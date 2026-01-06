/**
 * Server-side Auth Guard
 *
 * Validates admin access requirements:
 * 1. User is authenticated
 * 2. User has admin role with is_active=true
 * 3. User has MFA enabled
 * 4. If email+password user, password is fresh (< 180 days)
 *
 * Returns AdminUser object or throws redirect
 */

import { redirect } from 'next/navigation';
import {
  getAdminUser,
  getAdminRole,
  checkMfaEnabled,
  isPasswordFresh,
} from './supabase-server';
import type { AdminUser, AdminRole } from '@/types';

export interface AuthGuardResult {
  user: AdminUser;
  requiresAction: 'mfa' | 'password' | null;
}

/**
 * Verify admin access
 * Call this at the top of protected pages/layouts
 */
export async function verifyAdminAccess(
  options: {
    requiredRole?: AdminRole;
    allowPendingMfa?: boolean;
    allowExpiredPassword?: boolean;
  } = {}
): Promise<AuthGuardResult> {
  const {
    requiredRole,
    allowPendingMfa = false,
    allowExpiredPassword = false,
  } = options;

  // 1. Check authentication
  const user = await getAdminUser();
  if (!user) {
    redirect('/login');
  }

  // 2. Check admin role
  const adminRole = await getAdminRole(user.id);
  if (!adminRole) {
    redirect('/login?error=not_admin');
  }

  if (!adminRole.is_active) {
    redirect('/login?error=inactive');
  }

  // 3. Check required role level
  if (requiredRole) {
    const roleHierarchy: AdminRole[] = ['support_readonly', 'support_write_limited', 'admin'];
    const userRoleIndex = roleHierarchy.indexOf(adminRole.role as AdminRole);
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

    if (userRoleIndex < requiredRoleIndex) {
      redirect('/dashboard?error=insufficient_role');
    }
  }

  // 4. Check MFA
  const hasMfa = await checkMfaEnabled(user.id);
  if (!hasMfa && !allowPendingMfa) {
    redirect('/setup-mfa');
  }

  // 5. Check password freshness
  const passwordFresh = await isPasswordFresh(user.id, adminRole.last_password_change_at);
  if (!passwordFresh && !allowExpiredPassword) {
    redirect('/change-password');
  }

  const adminUser: AdminUser = {
    id: user.id,
    email: user.email ?? '',
    role: adminRole.role as AdminRole,
    isActive: adminRole.is_active,
    hasMfa,
    passwordFresh,
  };

  return {
    user: adminUser,
    requiresAction: !hasMfa ? 'mfa' : !passwordFresh ? 'password' : null,
  };
}

/**
 * Check if user can perform a specific action
 */
export async function canPerformAction(
  userId: string,
  action: string
): Promise<{ allowed: boolean; reason?: string }> {
  const adminRole = await getAdminRole(userId);

  if (!adminRole || !adminRole.is_active) {
    return { allowed: false, reason: 'No active admin role' };
  }

  // Check MFA for any write action
  const writeActions = ['delete_user', 'edit_profile', 'disable_uploads', 'export_data'];
  if (writeActions.includes(action)) {
    const hasMfa = await checkMfaEnabled(userId);
    if (!hasMfa) {
      return { allowed: false, reason: 'MFA required for this action' };
    }

    // Check password freshness for privileged actions
    const passwordFresh = await isPasswordFresh(userId, adminRole.last_password_change_at);
    if (!passwordFresh) {
      return { allowed: false, reason: 'Password change required' };
    }
  }

  // Check role-based permissions
  const rolePermissions: Record<string, string[]> = {
    support_readonly: ['view'],
    support_write_limited: ['view', 'edit_profile', 'disable_uploads'],
    admin: ['view', 'edit_profile', 'disable_uploads', 'delete_user', 'export_data', 'manage_roles'],
  };

  const allowedActions = rolePermissions[adminRole.role] ?? [];

  // Map specific actions to permission categories
  const actionMap: Record<string, string> = {
    view_user: 'view',
    view_audit: 'view',
    delete_user: 'delete_user',
    edit_profile: 'edit_profile',
    disable_uploads: 'disable_uploads',
    export_data: 'export_data',
    manage_roles: 'manage_roles',
  };

  const requiredPermission = actionMap[action] ?? action;

  if (!allowedActions.includes(requiredPermission)) {
    return { allowed: false, reason: `Role ${adminRole.role} cannot ${action}` };
  }

  return { allowed: true };
}
