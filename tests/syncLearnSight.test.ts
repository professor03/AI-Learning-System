import { afterEach, expect, test, vi } from 'vitest';
import { syncActiveLearnSight } from '../src/lib/syncLearnSight';
import { useLearnSightConnection } from '../src/store/useLearnSightStore';
import type { LearnSightSession } from '../src/lib/learnsightApi';
const session: LearnSightSession = {session_id:'gate',study_goal:'study',planned_minutes:25,source_id:'app',started_at:'2026-09-12T00:00:00Z',ended_at:null,status:'active',present_now:false,last_present_at:null,absence_started_at:null,away_reminder_eligible:false,observation_count:0,note:''};
afterEach(()=>{vi.unstubAllGlobals();useLearnSightConnection.setState({session:null,accessToken:null,isSyncing:false,syncError:null,connectorUrl:''});});
test('manual and automatic callers share one in-flight request',async()=>{
  useLearnSightConnection.setState({session,accessToken:'test',connectorUrl:'http://localhost:8000',isSyncing:false});
  let finish!: (value:Response)=>void;
  const fetch=vi.fn(()=>new Promise<Response>(resolve=>{finish=resolve;}));vi.stubGlobal('fetch',fetch);
  const first=syncActiveLearnSight();await syncActiveLearnSight();expect(fetch).toHaveBeenCalledTimes(1);
  finish(new Response(JSON.stringify({...session,observation_count:1})));await first;
  expect(useLearnSightConnection.getState().session?.observation_count).toBe(1);
  expect(useLearnSightConnection.getState().isSyncing).toBe(false);
});
test('an ended session ignores an outstanding failure',async()=>{
  useLearnSightConnection.setState({session,accessToken:'test',connectorUrl:'http://localhost:8000',isSyncing:false,syncError:null});
  let finish!: (value:Response)=>void;
  vi.stubGlobal('fetch',vi.fn(()=>new Promise<Response>(resolve=>{finish=resolve;})));
  const request=syncActiveLearnSight();useLearnSightConnection.getState().setSession({...session,status:'ended'});
  finish(new Response('{"detail":"offline"}',{status:503}));await request;
  expect(useLearnSightConnection.getState().syncError).toBeNull();
});

