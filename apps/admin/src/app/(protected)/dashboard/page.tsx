import { createAdminClient } from '@/lib/supabase-server';
import { verifyAdminAccess } from '@/lib/auth-guard';
import {
  Users,
  FileText,
  AlertTriangle,
  TrendingUp,
  Activity,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

async function getDashboardStats() {
  const adminClient = createAdminClient();

  // Get user count
  const { count: userCount } = await adminClient
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Get analysis count
  const { count: analysisCount } = await adminClient
    .from('analyses')
    .select('*', { count: 'exact', head: true });

  // Get recent audit logs
  const { data: recentAudit } = await adminClient
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  // Get critical alerts (account deletions, failed logins, etc.)
  const { data: alerts } = await adminClient
    .from('audit_logs')
    .select('*')
    .in('action', ['USER_DELETE', 'LOGIN_FAILED', 'UNAUTHORIZED_ACCESS'])
    .order('created_at', { ascending: false })
    .limit(5);

  // Get today's signups
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: todaySignups } = await adminClient
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  return {
    userCount: userCount ?? 0,
    analysisCount: analysisCount ?? 0,
    recentAudit: recentAudit ?? [],
    alerts: alerts ?? [],
    todaySignups: todaySignups ?? 0,
  };
}

export default async function DashboardPage() {
  const { user } = await verifyAdminAccess();
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.userCount.toLocaleString()}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Total Analyses"
          value={stats.analysisCount.toLocaleString()}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Today's Signups"
          value={stats.todaySignups.toLocaleString()}
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          title="Active Alerts"
          value={stats.alerts.length.toString()}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-background-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent-green" />
              Recent Activity
            </h3>
          </div>
          <div className="space-y-3">
            {stats.recentAudit.length === 0 ? (
              <p className="text-gray-400 text-sm">No recent activity</p>
            ) : (
              stats.recentAudit.map((log) => (
                <ActivityItem key={log.id} log={log} />
              ))
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-background-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-accent-red" />
              Security Alerts
            </h3>
          </div>
          <div className="space-y-3">
            {stats.alerts.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-6 h-6 text-accent-green" />
                </div>
                <p className="text-gray-400">No security alerts</p>
              </div>
            ) : (
              stats.alerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'green' | 'blue' | 'amber' | 'red';
}) {
  const colorClasses = {
    green: 'bg-accent-green/10 text-accent-green',
    blue: 'bg-blue-500/10 text-blue-400',
    amber: 'bg-accent-amber/10 text-accent-amber',
    red: 'bg-accent-red/10 text-accent-red',
  };

  return (
    <div className="bg-background-card rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ log }: { log: Record<string, unknown> }) {
  const actionColors: Record<string, string> = {
    USER_DELETE: 'text-accent-red',
    PROFILE_EDIT: 'text-accent-amber',
    DATA_EXPORT: 'text-blue-400',
    default: 'text-gray-400',
  };

  const action = log.action as string;
  const createdAt = log.created_at as string;

  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
      <div className="w-2 h-2 rounded-full bg-accent-green" />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${actionColors[action] ?? actionColors.default}`}>
          {action.replace(/_/g, ' ')}
        </p>
        <p className="text-xs text-gray-500 truncate">
          Actor: {(log.actor_user_id as string)?.slice(0, 8) ?? 'System'}...
        </p>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Clock className="w-3 h-3" />
        {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
      </div>
    </div>
  );
}

function AlertItem({ alert }: { alert: Record<string, unknown> }) {
  const action = alert.action as string;
  const createdAt = alert.created_at as string;

  return (
    <div className="flex items-start gap-3 p-3 bg-accent-red/5 border border-accent-red/20 rounded-lg">
      <AlertTriangle className="w-5 h-5 text-accent-red shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white">{action.replace(/_/g, ' ')}</p>
        <p className="text-xs text-gray-400 mt-1">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
