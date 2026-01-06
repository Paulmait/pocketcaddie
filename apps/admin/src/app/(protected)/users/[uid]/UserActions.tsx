'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  Ban,
  CheckCircle,
  Download,
  MoreVertical,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  deleteUser,
  toggleUploads,
  exportUserData,
} from '@/actions/user-actions';

interface UserActionsProps {
  userId: string;
  email: string;
  uploadsDisabled: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

export function UserActions({
  userId,
  email,
  uploadsDisabled,
  canWrite,
  canDelete,
}: UserActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        router.push('/users');
        router.refresh();
      } else {
        setError(result.error ?? 'Failed to delete user');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleToggleUploads = async () => {
    setIsToggling(true);
    setError(null);
    try {
      const result = await toggleUploads(userId, !uploadsDisabled);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? 'Failed to toggle uploads');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsToggling(false);
      setIsOpen(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const result = await exportUserData(userId);
      if (result.success && result.data) {
        // Create and download JSON file
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-export-${userId.slice(0, 8)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        setError(result.error ?? 'Failed to export user data');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {error && (
        <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg text-sm text-accent-red">
          {error}
        </div>
      )}

      {/* Actions Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-56 bg-background-card border border-gray-700 rounded-lg shadow-xl z-20 overflow-hidden">
            {/* Export */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export Debug Summary
            </button>

            {/* Toggle Uploads */}
            {canWrite && (
              <button
                onClick={handleToggleUploads}
                disabled={isToggling}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors disabled:opacity-50"
              >
                {isToggling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : uploadsDisabled ? (
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                ) : (
                  <Ban className="w-4 h-4 text-accent-amber" />
                )}
                {uploadsDisabled ? 'Enable Uploads' : 'Disable Uploads'}
              </button>
            )}

            {/* Delete */}
            {canDelete && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowDeleteConfirm(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-accent-red hover:bg-accent-red/10 transition-colors border-t border-gray-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete User
              </button>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background-card border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent-red/10 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-accent-red" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Delete User Account
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Are you sure you want to delete this user account? This action
                  cannot be undone.
                </p>
                <p className="text-sm text-white mt-2 font-medium">
                  {email}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm bg-accent-red text-white rounded-lg hover:bg-accent-red/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
