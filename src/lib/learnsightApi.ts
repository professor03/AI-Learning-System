export interface LearnSightSession {
  session_id: string;
  study_goal: string;
  planned_minutes: number;
  source_id: string;
  started_at: string;
  ended_at: string | null;
  status: 'active' | 'ended';
  present_now: boolean;
  last_present_at: string | null;
  absence_started_at: string | null;
  away_reminder_eligible: boolean;
  observation_count: number;
  note: string;
  person_count?: number | null;
  last_observed_at?: string | null;
  detector_source_id?: string | null;
  signal_origin?: 'none' | 'manual' | 'detector';
  signal_status?: 'waiting' | 'fresh' | 'stale' | 'unavailable';
  signal_max_age_seconds?: number;
}

interface LoginResponse {
  access_token: string;
}

const parseError = async (response: Response) => {
  const payload = await response.json().catch(() => null) as { detail?: string } | null;
  return payload?.detail || `連線失敗（${response.status}）`;
};

const request = async <T>(
  baseUrl: string,
  path: string,
  init: RequestInit = {},
  accessToken?: string,
): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
      ...init,
      signal: AbortSignal.timeout(15_000),
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new Error('無法連上 LearnSight 視覺服務。請確認 YOLO 服務已在本機執行。');
  }

  if (!response.ok) throw new Error(await parseError(response));
  return response.json() as Promise<T>;
};

export const loginLearnSight = (baseUrl: string, username: string, password: string) =>
  request<LoginResponse>(baseUrl, '/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const startLearnSightSession = (
  baseUrl: string,
  accessToken: string,
  studyGoal: string,
  plannedMinutes: number,
  detectorSourceId?: string,
) => request<LearnSightSession>(baseUrl, '/api/v1/learnsight/sessions', {
  method: 'POST',
  body: JSON.stringify({
    study_goal: studyGoal,
    planned_minutes: plannedMinutes,
    source_id: 'ai-student-os',
    ...(detectorSourceId?.trim() ? { detector_source_id: detectorSourceId.trim() } : {}),
  }),
}, accessToken);

export const syncLearnSightVision = (baseUrl: string, accessToken: string, sessionId: string) =>
  request<LearnSightSession>(baseUrl, `/api/v1/learnsight/sessions/${sessionId}/sync`, {
    method: 'POST',
  }, accessToken);

export const endLearnSightSession = (baseUrl: string, accessToken: string, sessionId: string) =>
  request<LearnSightSession>(baseUrl, `/api/v1/learnsight/sessions/${sessionId}/end`, {
    method: 'POST',
  }, accessToken);

