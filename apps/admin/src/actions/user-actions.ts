'use server';

import { createAdminClient, writeAuditLog, getAdminUser, getAdminRole } from '@/lib/supabase-server';
import { hasPermission } from '@/types';

interface ActionResult {
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
}

/**
 * Delete a user account completely
 * - Requires users:delete permission
 * - Calls the delete-account edge function
 * - Logs the action to audit_logs
 */
export async function deleteUser(userId: string): Promise<ActionResult> {
  const currentUser = await getAdminUser();
  if (!currentUser) {
    return { success: false, error: 'Not authenticated' };
  }

  const adminRole = await getAdminRole(currentUser.id);
  if (!adminRole || !hasPermission(adminRole.role, 'users:delete')) {
    return { success: false, error: 'Insufficient permissions' };
  }

  const adminClient = createAdminClient();

  try {
    // Get user details for audit log
    const { data: userProfile } = await adminClient
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    // Delete auth user (this cascades to profile via trigger)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      await writeAuditLog({
        action: 'USER_DELETE_FAILED',
        actorUserId: currentUser.id,
        targetUserId: userId,
        metadata: { error: deleteError.message },
      });
      return { success: false, error: deleteError.message };
    }

    // Log successful deletion
    await writeAuditLog({
      action: 'USER_DELETE',
      actorUserId: currentUser.id,
      targetUserId: userId,
      metadata: {
        deleted_email: userProfile?.email ?? 'unknown',
        deleted_by_admin: true,
      },
    });

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    await writeAuditLog({
      action: 'USER_DELETE_FAILED',
      actorUserId: currentUser.id,
      targetUserId: userId,
      metadata: { error: errorMessage },
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Toggle user's ability to upload videos
 * - Requires users:write permission
 * - Sets uploads_disabled flag on profile
 * - Logs the action to audit_logs
 */
export async function toggleUploads(
  userId: string,
  disable: boolean
): Promise<ActionResult> {
  const currentUser = await getAdminUser();
  if (!currentUser) {
    return { success: false, error: 'Not authenticated' };
  }

  const adminRole = await getAdminRole(currentUser.id);
  if (!adminRole || !hasPermission(adminRole.role, 'users:write')) {
    return { success: false, error: 'Insufficient permissions' };
  }

  const adminClient = createAdminClient();

  try {
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ uploads_disabled: disable })
      .eq('id', userId);

    if (updateError) {
      await writeAuditLog({
        action: disable ? 'UPLOADS_DISABLE_FAILED' : 'UPLOADS_ENABLE_FAILED',
        actorUserId: currentUser.id,
        targetUserId: userId,
        metadata: { error: updateError.message },
      });
      return { success: false, error: updateError.message };
    }

    await writeAuditLog({
      action: disable ? 'UPLOADS_DISABLED' : 'UPLOADS_ENABLED',
      actorUserId: currentUser.id,
      targetUserId: userId,
      metadata: { new_state: disable ? 'disabled' : 'enabled' },
    });

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * Export user data for debugging (redacted)
 * - Available to all admin roles (read access)
 * - Returns profile, analysis count, recent activity
 * - PII is partially redacted
 * - Logs the action to audit_logs
 */
export async function exportUserData(userId: string): Promise<ActionResult> {
  const currentUser = await getAdminUser();
  if (!currentUser) {
    return { success: false, error: 'Not authenticated' };
  }

  const adminRole = await getAdminRole(currentUser.id);
  if (!adminRole) {
    return { success: false, error: 'Insufficient permissions' };
  }

  const adminClient = createAdminClient();

  try {
    // Get profile (redact sensitive fields)
    const { data: profile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) {
      return { success: false, error: 'User not found' };
    }

    // Get analysis count and summary
    const { count: analysisCount } = await adminClient
      .from('analyses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { data: recentAnalyses } = await adminClient
      .from('analyses')
      .select('id, created_at, confidence_score, primary_issue')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get auth user metadata
    const { data: authUser } = await adminClient.auth.admin.getUserById(userId);

    // Build redacted export
    const exportData = {
      export_generated_at: new Date().toISOString(),
      export_generated_by: currentUser.id,
      user: {
        id: userId,
        // Redact email to first 3 chars
        email_redacted: profile.email
          ? `${profile.email.slice(0, 3)}***@***`
          : null,
        full_name_redacted: profile.full_name
          ? `${profile.full_name.slice(0, 2)}***`
          : null,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        uploads_disabled: profile.uploads_disabled,
        subscription_status: profile.subscription_status,
        subscription_tier: profile.subscription_tier,
      },
      auth: {
        provider: authUser?.user?.app_metadata?.provider ?? 'unknown',
        email_confirmed: !!authUser?.user?.email_confirmed_at,
        last_sign_in: authUser?.user?.last_sign_in_at,
        mfa_enabled: (authUser?.user?.factors?.length ?? 0) > 0,
        created_at: authUser?.user?.created_at,
      },
      analyses: {
        total_count: analysisCount ?? 0,
        recent: recentAnalyses?.map((a) => ({
          id: a.id,
          created_at: a.created_at,
          confidence_score: a.confidence_score,
          primary_issue: a.primary_issue,
        })) ?? [],
      },
    };

    await writeAuditLog({
      action: 'DATA_EXPORT',
      actorUserId: currentUser.id,
      targetUserId: userId,
      metadata: { export_type: 'debug_summary' },
    });

    return { success: true, data: exportData };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    await writeAuditLog({
      action: 'DATA_EXPORT_FAILED',
      actorUserId: currentUser.id,
      targetUserId: userId,
      metadata: { error: errorMessage },
    });
    return { success: false, error: errorMessage };
  }
}
