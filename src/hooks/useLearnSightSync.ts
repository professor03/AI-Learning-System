import { useEffect } from 'react';
import { useLearnSightConnection } from '../store/useLearnSightStore';
import { syncActiveLearnSight } from '../lib/syncLearnSight';

/** Mount once at app level: reading notes must not stop an active study session. */
export function useLearnSightSync() {
  const autoSync = useLearnSightConnection(s => s.autoSync);
  const token = useLearnSightConnection(s => s.accessToken);
  const url = useLearnSightConnection(s => s.connectorUrl);
  const sessionId = useLearnSightConnection(s => s.session?.session_id);
  const status = useLearnSightConnection(s => s.session?.status);
  useEffect(() => {
    if(!autoSync || !token || !url || status !== 'active') return;
    void syncActiveLearnSight();
    const timer = window.setInterval(() => { void syncActiveLearnSight(); }, 5000);
    return () => window.clearInterval(timer);
  }, [autoSync, token, url, sessionId, status]);
}

