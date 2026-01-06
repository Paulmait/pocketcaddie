'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface SearchFormProps {
  initialSearch?: string;
}

export function SearchForm({ initialSearch }: SearchFormProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set('search', search.trim());
    }
    router.push(`/users?${params.toString()}`);
  };

  const handleClear = () => {
    setSearch('');
    router.push('/users');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or user ID..."
          className="w-full pl-10 pr-10 py-2.5 bg-background-card border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-green transition-colors"
        />
        {search && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="px-4 py-2.5 bg-accent-green text-white rounded-lg hover:bg-accent-green/90 transition-colors font-medium"
      >
        Search
      </button>
    </form>
  );
}
