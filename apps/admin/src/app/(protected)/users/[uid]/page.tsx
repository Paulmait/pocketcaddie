import { notFound } from 'next/navigation';
import { createAdminClient, writeAuditLog, getAdminUser } from '@/lib/supabase-server';
import { verifyAdminAccess } from '@/lib/auth-guard';
import { hasPermission } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';
import {
  User,
  Mail,
  Calendar,
  CreditCard,
  Video,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { UserActions } from './UserActions';

interface PageProps {
  params: Promise<{ uid: string }>;
}

async function getUserDetails(uid: string) {
  const adminClient = createAdminClient();

  // Get user profile
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .single();

  if (profileError || !profile) {
    return null;
  }

  // Get analysis count and recent analyses
  const { count: analysisCount } = await adminClient
    .from('analyses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', uid);

  const { data: recentAnalyses } = await adminClient
    .from('analyses')
    .select('id, created_at, confidence_score, primary_issue')
    .eq('user_id', uid)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get auth user details for email
  const { data: authUser } = await adminClient.auth.admin.getUserById(uid);

  return {
    profile,
    email: authUser?.user?.email ?? profile.email,
    analysisCount: analysisCount ?? 0,
    recentAnalyses: recentAnalyses ?? [],
    authUser: authUser?.user,
  };
}

export default async function UserDetailPage({ params }: PageProps) {
  const { user: adminUser } = await verifyAdminAccess();
  const { uid } = await params;

  const userData = await getUserDetails(uid);

  if (!userData) {
    notFound();
  }

  const { profile, email, analysisCount, recentAnalyses, authUser } = userData;

  // Log view action
  const currentUser = await getAdminUser();
  if (currentUser) {
    await writeAuditLog({
      action: 'USER_VIEW',
      actorUserId: currentUser.id,
      targetUserId: uid,
      metadata: { email },
    });
  }

  const canWrite = hasPermission(adminUser.role, 'users:write');
  const canDelete = hasPermission(adminUser.role, 'users:delete');

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/users"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {profile.full_name ?? 'No name'}
            </h1>
            <p className="text-gray-400">{email}</p>
            {profile.uploads_disabled && (
              <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 text-xs font-medium bg-accent-red/10 text-accent-red rounded-full">
                Uploads Disabled
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        {(canWrite || canDelete) && (
          <UserActions
            userId={uid}
            email={email}
            uploadsDisabled={profile.uploads_disabled ?? false}
            canWrite={canWrite}
            canDelete={canDelete}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="bg-background-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-accent-green" />
            Profile
          </h3>
          <div className="space-y-4">
            <InfoRow label="User ID" value={uid} mono />
            <InfoRow
              label="Email"
              value={email ?? 'Not set'}
              icon={Mail}
            />
            <InfoRow
              label="Joined"
              value={format(new Date(profile.created_at), 'PPP')}
              icon={Calendar}
            />
            {profile.updated_at && (
              <InfoRow
                label="Last Updated"
                value={formatDistanceToNow(new Date(profile.updated_at), { addSuffix: true })}
              />
            )}
          </div>
        </div>

        {/* Auth Info */}
        <div className="bg-background-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent-green" />
            Authentication
          </h3>
          <div className="space-y-4">
            <InfoRow
              label="Provider"
              value={authUser?.app_metadata?.provider ?? 'Unknown'}
            />
            <InfoRow
              label="Email Verified"
              value={authUser?.email_confirmed_at ? 'Yes' : 'No'}
            />
            <InfoRow
              label="Last Sign In"
              value={
                authUser?.last_sign_in_at
                  ? formatDistanceToNow(new Date(authUser.last_sign_in_at), { addSuffix: true })
                  : 'Never'
              }
            />
            <InfoRow
              label="MFA Enabled"
              value={authUser?.factors && authUser.factors.length > 0 ? 'Yes' : 'No'}
            />
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-background-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-accent-green" />
            Subscription
          </h3>
          <div className="space-y-4">
            <InfoRow
              label="Status"
              value={profile.subscription_status ?? 'Free'}
            />
            {profile.subscription_tier && (
              <InfoRow label="Tier" value={profile.subscription_tier} />
            )}
            {profile.subscription_expires_at && (
              <InfoRow
                label="Expires"
                value={format(new Date(profile.subscription_expires_at), 'PPP')}
              />
            )}
          </div>
        </div>
      </div>

      {/* Analysis Summary */}
      <div className="bg-background-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Video className="w-5 h-5 text-accent-green" />
          Swing Analyses ({analysisCount})
        </h3>
        {recentAnalyses.length === 0 ? (
          <p className="text-gray-400">No analyses yet</p>
        ) : (
          <div className="space-y-3">
            {recentAnalyses.map((analysis) => (
              <div
                key={analysis.id}
                className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0"
              >
                <div>
                  <p className="text-sm text-white">
                    {analysis.primary_issue ?? 'Analysis'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                  </p>
                </div>
                {analysis.confidence_score && (
                  <span className="text-sm text-accent-green">
                    {Math.round(analysis.confidence_score * 100)}% confidence
                  </span>
                )}
              </div>
            ))}
            {analysisCount > 5 && (
              <p className="text-sm text-gray-400 pt-2">
                + {analysisCount - 5} more analyses
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon: Icon,
  mono,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between">
      <span className="text-sm text-gray-400 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </span>
      <span className={`text-sm text-white text-right ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}
