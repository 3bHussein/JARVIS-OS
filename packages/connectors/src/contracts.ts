import type { Domain, Source } from '../../core/src/index.ts';
export type ConnectorStatus = 'disconnected' | 'ready' | 'error' | 'blocked';
export interface ConnectorManifest {
  id: string; name: string; domain: Domain; capabilities: readonly string[];
  authentication: string; permissions: readonly string[]; writes: false;
  maxAgeMs: number; audit: readonly string[]; limitation: string; launchUrl?: string;
}
export interface ConnectorResult<T> { status: ConnectorStatus; source: Source; data: T | null; error?: 'not_connected' | 'unauthorized' | 'forbidden' | 'rate_limited' | 'upstream_unavailable' | 'invalid_response'; retryAt?:string; cache?:'hit'|'miss'|'revalidated'; }
export interface ConnectorView extends ConnectorManifest {
  status:ConnectorStatus|'configured'|'stale';lastSuccessfulSync:string|null;
  freshness:'current'|'stale'|'unavailable';lastError:ConnectorResult<unknown>['error']|null;
}
export interface ReadConnector<T> { manifest: ConnectorManifest; health(): Promise<ConnectorStatus>; read(): Promise<ConnectorResult<T>>; }
export const manifests: ConnectorManifest[] = [
  {id:'github',name:'GitHub',domain:'personal',capabilities:['repositories','pull_requests','issues','actions'],authentication:'Server-side selected-repository fine-grained token; OAuth app planned',permissions:['metadata:read','contents:read','pull_requests:read','issues:read','actions:read'],writes:false,maxAgeMs:300000,audit:['connector.read','connector.failure'],limitation:'Configured server credential required. Source text is untrusted.',launchUrl:'https://github.com/3bHussein'},
  {id:'progressxx',name:'ProgressXX',domain:'health',capabilities:['launch'],authentication:'Existing Supabase user session; delegated read API not yet available',permissions:[],writes:false,maxAgeMs:900000,audit:['connector.read'],limitation:'Snapshot/local pending data cannot be inferred from tables alone.',launchUrl:'https://3bhussein.github.io/ProgressXX-Web/'},
  {id:'whoop',name:'WHOOP Intelligence',domain:'health',capabilities:['launch'],authentication:'Existing Supabase user JWT; reuse whoop-data read after account-linking design',permissions:[],writes:false,maxAgeMs:3600000,audit:['connector.read'],limitation:'CORS and delegated identity need review. No health data retrieved.',launchUrl:'https://3bhussein.github.io/Whoop-Intelligence-/'},
  {id:'timesheet',name:'Week Timesheet',domain:'personal',capabilities:[],authentication:'Google account / private Sheets read-only OAuth planned',permissions:[],writes:false,maxAgeMs:900000,audit:['connector.read'],limitation:'Private Apps Script UI bridge; getState may initialize sheets. No safe external read contract yet.'},
  {id:'factory',name:'Project Factory AI',domain:'personal',capabilities:['launch'],authentication:'GitHub read access; local worker separately approved',permissions:[],writes:false,maxAgeMs:300000,audit:['connector.read'],limitation:'No general remote generation API observed; no jobs dispatched.',launchUrl:'https://github.com/3bHussein/Project-Factory-AI'},
  {id:'lexora',name:'Lexora Academy',domain:'personal',capabilities:['launch'],authentication:'No cloud progress identity observed',permissions:[],writes:false,maxAgeMs:86400000,audit:['connector.read'],limitation:'Progress is browser-local. Launch only.',launchUrl:'https://3bhussein.github.io/Lexora-Academy/'},
  {id:'cloudhub',name:'CloudHub',domain:'personal',capabilities:[],authentication:'Existing HttpOnly local session cookie; delegation pending',permissions:[],writes:false,maxAgeMs:300000,audit:['connector.read'],limitation:'API source exists; deployed base URL and safe delegation unavailable.'},
  {id:'autel',name:'Autel Code Manager',domain:'corporate',capabilities:[],authentication:'Separate corporate authorization required',permissions:[],writes:false,maxAgeMs:300000,audit:['connector.read'],limitation:'Disabled. No approved sanitized operational endpoint. Never read code or customer routes.'},
];
