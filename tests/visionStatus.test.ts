import { expect, test } from 'vitest';
import { visionStatus } from '../src/lib/visionStatus';
import type { LearnSightSession } from '../src/lib/learnsightApi';

const session: LearnSightSession = {
  session_id:'s', study_goal:'study', planned_minutes:25, source_id:'app', started_at:'2026-09-12T00:00:00Z',
  ended_at:null, status:'active', present_now:true, last_present_at:null, absence_started_at:null,
  away_reminder_eligible:false, observation_count:1, note:'', signal_origin:'detector', signal_status:'fresh',
  last_observed_at:'2026-09-12T00:00:00Z', person_count:1, detector_source_id:'local-video',
};
const now = Date.parse(session.last_observed_at!);
test('live person, zero, missing and stale are different', () => {
  expect(visionStatus(session,null,now).title).toContain('有人');
  expect(visionStatus({...session,present_now:false,person_count:0},null,now).title).toContain('未偵測到人物');
  expect(visionStatus(session,'服務已停止',now).title).toContain('無法使用');
  expect(visionStatus(session,null,now+31_000).title).toContain('過期');
  expect(visionStatus({...session,signal_status:'waiting'},null,now).title).toContain('等待');
});
test('manual and old API never claim verified live detection', () => {
  expect(visionStatus({...session,signal_origin:'manual'},null,now).title).toContain('模擬');
  expect(visionStatus({...session,signal_status:undefined},null,now).title).toContain('更新');
});
test('ending takes precedence over signal errors', () => {
  expect(visionStatus({...session,status:'ended'},'offline',now).title).toContain('已結束');
});

