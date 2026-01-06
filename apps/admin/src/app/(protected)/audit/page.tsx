import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase-server';
import { verifyAdminAccess } from '@/lib/auth-guard';
import { formatDistanceToNow, format } from 'date-fns';
import {
  FileText,
  Filter,
  User,
  Trash2,
  Edit,
  Download,
  Shield,
  Ban,
  CheckCircle,
  AlertTriangle,
  Eye,
  Search as SearchIcon,
  LogIn,
  LogOut,
} from 'lucide-react';
import { AuditFilters } from './AuditFilters';

interface SearchParams {
  action?: string;
  actor?: string;
  page?: string;
}

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  USER_VIEW: Eye,
  USER_SEARCH: SearchIcon,
  USER_DELETE: Trash2,
  USER_DELETE_FAILED: AlertTriangle,
  PROFILE_EDIT: Edit,
  DATA_EXPORT: Download,
  DATA_EXPORT_FAILED: AlertTriangle,
  UPLOADS_DISABLED: Ban,
  UPLOADS_ENABLED: CheckCircle,
  LOGIN_SUCCESS: LogIn,
  LOGIN_FAILED: AlertTriangle,
  LOGOUT: LogOut,
  MFA_ENABLED: Shield,
  UNAUTHORIZED_ACCESS: AlertTriangle,
};

const ACTION_COLORS: Record<string, string> = {
  USER_VIEW: 'text-gray-400',
  USER_SEARCH: 'text-gray-400',
  USER_DELETE: 'text-accent-red',
  USER_DELETE_FAILED: 'text-accent-red',
  PROFILE_EDIT: 'text-accent-amber',
  DATA_EXPORT: 'text-blue-400',
  DATA_EXPORT_FAILED: 'text-accent-red',
  UPLOADS_DISABLED: 'text-accent-amber',
  UPLOADS_ENABLED: 'text-accent-green',
  LOGIN_SUCCESS: 'text-accent-green',
  LOGIN_FAILED: 'text-accent-red',
  LOGOUT: 'text-gray-400',
  MFA_ENABLED: 'text-accent-green',
  UNAUTHORIZED_ACCESS: 'text-accent-red',
};

async function getAuditLogs(filters: SearchParams, page: number = 1) {
  const adminClient = createAdminClient();
  const pageSize = 50;
  const offset = (page - 1) * pageSize;

  let query = adminClient
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (filters.action) {
    query = query.eq('action', filters.action);
  }

  if (filters.actor) {
    query = query.eq('actor_user_id', filters.actor);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching audit logs:', error);
    return { logs: [], total: 0 };
  }

  return { logs: data ?? [], total: count ?? 0 };
}

async function getDistinctActions() {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from('audit_logs')
    .select('action')
    .limit(1000);

  if (!data) return [];

  const actions = [...new Set(data.map((d) => d.action))];
  return actions.sort();
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { user } = await verifyAdminAccess();

  // Only admin role can view audit logs
  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const page = parseInt(params.page ?? '1', 10);

  const [{ logs, total }, distinctActions] = await Promise.all([
    getAuditLogs(params, page),
    getDistinctActions(),
  ]);

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-green/10 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-accent-green" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Audit Log</h1>
            <p className="text-sm text-gray-400">
              {total.toLocaleString()} total event{total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AuditFilters
        actions={distinctActions}
        currentAction={params.action}
        currentActor={params.actor}
      />

      {/* Audit Log Table */}
      <div className="bg-background-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                Action
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                Actor
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                Target
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                Details
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400">No audit logs found</p>
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const Icon = ACTION_ICONS[log.action] ?? FileText;
                const colorClass = ACTION_COLORS[log.action] ?? 'text-gray-400';

                return (
                  <tr
                    key={log.id}
                    className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${colorClass}`} />
                        <span className={`text-sm font-medium ${colorClass}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.actor_user_id ? (
                        <code className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                          {log.actor_user_id.slice(0, 8)}...
                        </code>
                      ) : (
                        <span className="text-xs text-gray-500">System</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {log.target_user_id ? (
                        <a
                          href={`/users/${log.target_user_id}`}
                          className="text-xs text-accent-green hover:underline font-mono"
                        >
                          {log.target_user_id.slice(0, 8)}...
                        </a>
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {log.metadata ? (
                        <MetadataDisplay metadata={log.metadata} />
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-white">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(log.created_at), 'PPp')}
                        </p>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          action={params.action}
          actor={params.actor}
        />
      )}
    </div>
  );
}

function MetadataDisplay({ metadata }: { metadata: Record<string, unknown> }) {
  const entries = Object.entries(metadata).slice(0, 2);

  return (
    <div className="space-y-1">
      {entries.map(([key, value]) => (
        <div key={key} className="text-xs">
          <span className="text-gray-500">{key}: </span>
          <span className="text-gray-300">
            {typeof value === 'string'
              ? value.length > 30
                ? `${value.slice(0, 30)}...`
                : value
              : JSON.stringify(value)}
          </span>
        </div>
      ))}
      {Object.keys(metadata).length > 2 && (
        <span className="text-xs text-gray-500">
          +{Object.keys(metadata).length - 2} more
        </span>
      )}
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  action,
  actor,
}: {
  currentPage: number;
  totalPages: number;
  action?: string;
  actor?: string;
}) {
  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    if (action) params.set('action', action);
    if (actor) params.set('actor', actor);
    params.set('page', page.toString());
    return `/audit?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-400">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        {currentPage > 1 && (
          <a
            href={buildUrl(currentPage - 1)}
            className="px-4 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Previous
          </a>
        )}
        {currentPage < totalPages && (
          <a
            href={buildUrl(currentPage + 1)}
            className="px-4 py-2 text-sm bg-accent-green text-white rounded-lg hover:bg-accent-green/90 transition-colors"
          >
            Next
          </a>
        )}
      </div>
    </div>
  );
}
