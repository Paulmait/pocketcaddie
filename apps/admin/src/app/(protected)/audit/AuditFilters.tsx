'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, X } from 'lucide-react';

interface AuditFiltersProps {
  actions: string[];
  currentAction?: string;
  currentActor?: string;
}

export function AuditFilters({
  actions,
  currentAction,
  currentActor,
}: AuditFiltersProps) {
  const router = useRouter();
  const [action, setAction] = useState(currentAction ?? '');
  const [actor, setActor] = useState(currentActor ?? '');

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (action) params.set('action', action);
    if (actor) params.set('actor', actor);
    router.push(`/audit?${params.toString()}`);
  };

  const handleClear = () => {
    setAction('');
    setActor('');
    router.push('/audit');
  };

  const hasFilters = currentAction || currentActor;

  return (
    <div className="bg-background-card rounded-xl p-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-gray-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filters</span>
        </div>

        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-accent-green"
        >
          <option value="">All Actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a.replace(/_/g, ' ')}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={actor}
          onChange={(e) => setActor(e.target.value)}
          placeholder="Actor User ID"
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-green w-48"
        />

        <button
          onClick={handleFilter}
          className="px-4 py-2 bg-accent-green text-white text-sm rounded-lg hover:bg-accent-green/90 transition-colors"
        >
          Apply
        </button>

        {hasFilters && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
