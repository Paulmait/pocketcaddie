'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight, User, Ban } from 'lucide-react';

interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  uploads_disabled?: boolean;
  created_at: string;
  updated_at?: string;
}

interface UsersTableProps {
  users: UserProfile[];
}

export function UsersTable({ users }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="bg-background-card rounded-xl p-12 text-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
        <p className="text-gray-400">
          Try adjusting your search criteria
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background-card rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
              User
            </th>
            <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
              ID
            </th>
            <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
              Status
            </th>
            <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
              Joined
            </th>
            <th className="w-12"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-white">
                        {(user.email ?? user.full_name ?? '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {user.full_name ?? 'No name'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {user.email ?? 'No email'}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <code className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                  {user.id.slice(0, 8)}...
                </code>
              </td>
              <td className="px-6 py-4">
                {user.uploads_disabled ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-accent-red/10 text-accent-red rounded-full">
                    <Ban className="w-3 h-3" />
                    Disabled
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-accent-green/10 text-accent-green rounded-full">
                    Active
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-400">
                {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
              </td>
              <td className="px-6 py-4">
                <Link
                  href={`/users/${user.id}`}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors inline-flex"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
