import { syncLearnSightVision } from './learnsightApi';
import { useLearnSightConnection } from '../store/useLearnSightStore';

/** Shared gate for automatic and manual sync, including across route changes. */
export async function syncActiveLearnSight() {
  const state = useLearnSightConnection.getState();
  if (state.isSyncing || !state.accessToken || !state.connectorUrl || state.session?.status !== 'active') return;
  const id = state.session.session_id;
  state.setIsSyncing(true);
  const stillCurrent = () => {
    const current = useLearnSightConnection.getState();
    return current.accessToken === state.accessToken && current.session?.session_id === id && current.session.status === 'active';
  };
  try {
    const next = await syncLearnSightVision(state.connectorUrl, state.accessToken, id);
    if(stillCurrent()) { state.setSession(next); state.setSyncError(null); }
  } catch(error) {
    if(stillCurrent()) state.setSyncError(error instanceof Error ? error.message : '同步失敗');
  } finally { state.setIsSyncing(false); }
}

