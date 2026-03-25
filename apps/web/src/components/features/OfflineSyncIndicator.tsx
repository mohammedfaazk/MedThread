'use client';

import React, { useEffect, useState } from 'react';
import { getSyncStatus, syncPendingActions } from '@/lib/offlineSync';

export const OfflineSyncIndicator: React.FC = () => {
  const [status, setStatus] = useState(getSyncStatus());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getSyncStatus());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (status.isOnline && status.pendingActions === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!status.isOnline ? (
            <>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Offline Mode</span>
            </>
          ) : status.syncInProgress ? (
            <>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-spin" />
              <span className="text-sm font-medium">Syncing...</span>
            </>
          ) : status.pendingActions > 0 ? (
            <>
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">{status.pendingActions} pending</span>
            </>
          ) : null}
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          {showDetails ? 'Hide' : 'Details'}
        </button>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t text-xs space-y-1">
          <div>Status: {status.isOnline ? 'Online' : 'Offline'}</div>
          <div>Pending: {status.pendingActions}</div>
          <div>Failed: {status.failedActions}</div>
          {status.pendingActions > 0 && (
            <button
              onClick={() => syncPendingActions()}
              className="mt-2 w-full bg-blue-600 text-white py-1 rounded text-xs hover:bg-blue-700"
            >
              Sync Now
            </button>
          )}
        </div>
      )}
    </div>
  );
};
