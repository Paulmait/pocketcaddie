/**
 * Admin Portal Types
 */

export type AdminRole = 'support_readonly' | 'support_write_limited' | 'admin';

export interface AdminRoleRecord {
  user_id: string;
  role: AdminRole;
  is_active: boolean;
  last_password_change_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  hasMfa: boolean;
  passwordFresh: boolean;
}

export interface AuditLog {
  id: string;
  created_at: string;
  actor_user_id: string | null;
  actor_role: string;
  action: string;
  target_user_id: string | null;
  metadata: Record<string, unknown>;
  ip_hash: string | null;
  user_agent: string | null;
}

export interface UserProfile {
  id: string;
  email: string | null;
  created_at: string;
  updated_at: string | null;
  full_name: string | null;
  uploads_disabled: boolean;
}

export interface UserAnalysis {
  id: string;
  created_at: string;
  root_cause_title: string | null;
  confidence: string | null;
  completed: boolean;
}

export interface UserSubscription {
  type: 'monthly' | 'annual' | null;
  status: 'active' | 'trial' | 'expired' | 'none';
  expiresAt: string | null;
}

export interface UserDetail {
  profile: UserProfile;
  analyses: UserAnalysis[];
  subscription: UserSubscription;
  auditLogs: AuditLog[];
}

// Permission checks
export const ROLE_PERMISSIONS = {
  support_readonly: ['view_users', 'view_audit'],
  support_write_limited: ['view_users', 'view_audit', 'edit_profile', 'disable_uploads'],
  admin: ['view_users', 'view_audit', 'edit_profile', 'disable_uploads', 'delete_user', 'export_data', 'manage_roles'],
} as const;

export type Permission = typeof ROLE_PERMISSIONS[AdminRole][number];

export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission as never);
}
