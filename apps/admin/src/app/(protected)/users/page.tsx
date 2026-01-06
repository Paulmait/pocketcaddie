import { createAdminClient, writeAuditLog, getAdminUser } from '@/lib/supabase-server';
import { verifyAdminAccess } from '@/lib/auth-guard';
import { UsersTable } from './UsersTable';
import { SearchForm } from './SearchForm';
import { Users as UsersIcon } from 'lucide-react';

interface SearchParams {
  search?: string;
  page?: string;
}

async function getUsers(search?: string, page: number = 1) {
  const adminClient = createAdminClient();
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  let query = adminClient
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (search) {
    // Search by email or user ID
    query = query.or(`id.eq.${search},email.ilike.%${search}%`);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching users:', error);
    return { users: [], total: 0 };
  }

  return { users: data ?? [], total: count ?? 0 };
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { user } = await verifyAdminAccess();
  const params = await searchParams;
  const search = params.search;
  const page = parseInt(params.page ?? '1', 10);

  const { users, total } = await getUsers(search, page);
  const totalPages = Math.ceil(total / 20);

  // Log user list view if searching
  if (search) {
    const currentUser = await getAdminUser();
    if (currentUser) {
      await writeAuditLog({
        action: 'USER_SEARCH',
        actorUserId: currentUser.id,
        metadata: { search_query: search, results_count: users.length },
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-green/10 rounded-lg flex items-center justify-center">
            <UsersIcon className="w-5 h-5 text-accent-green" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Users</h1>
            <p className="text-sm text-gray-400">
              {total.toLocaleString()} total user{total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <SearchForm initialSearch={search} />

      {/* Users Table */}
      <UsersTable users={users} />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          search={search}
        />
      )}
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  search,
}: {
  currentPage: number;
  totalPages: number;
  search?: string;
}) {
  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    params.set('page', page.toString());
    return `/users?${params.toString()}`;
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
