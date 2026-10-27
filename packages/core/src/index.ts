export type Locale = 'en' | 'ar';
export type Domain = 'personal' | 'health' | 'corporate';
export type CoreState = 'booting' | 'idle' | 'listening' | 'thinking' | 'speaking' | 'sleeping';
export type Freshness = 'current' | 'stale' | 'unavailable';
export interface Source { connector: string; observedAt: string | null; maxAgeMs: number; }
export interface Task { id: string; title: string; date: string; source: Source; }
export function clock(now: Date, timeZone: string, locale: Locale = 'en') {
  if (!Number.isFinite(now.getTime())) throw new Error('Invalid date');
  // Intl validates IANA zones and uses the date-specific DST offset.
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(now);
  const get = (key: string) => parts.find(p => p.type === key)!.value;
  const hour = Number(get('hour'));
  const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const greetings = { en: {morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening'}, ar: {morning: 'صباح الخير', afternoon: 'مساء الخير', evening: 'مساء الخير'} };
  return { greeting: greetings[locale][period], period, date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` };
}
export function freshness(source: Source, now: Date): Freshness {
  if (!source.observedAt || !Number.isFinite(source.maxAgeMs) || source.maxAgeMs < 0) return 'unavailable';
  const age = now.getTime() - Date.parse(source.observedAt);
  if (!Number.isFinite(age) || age < 0) return 'unavailable';
  return age <= source.maxAgeMs ? 'current' : 'stale';
}
export function briefing(tasks: Task[], now: Date, zone: string, locale: Locale) {
  const c = clock(now, zone, locale);
  const today = tasks.filter(t => t.date === c.date && freshness(t.source, now) === 'current');
  return { ...c, tasks: today, unavailable: tasks.length - today.length,
    message: today.length ? (locale === 'ar' ? `عندك ${today.length} مهمة من المصادر المتصلة النهارده.` : `${today.length} tasks from connected sources today.`) : (locale === 'ar' ? 'مفيش مهام مؤكدة متاحة. وصّل مصدر بيانات علشان أقدر ألخّص يومك.' : 'No verified tasks available. Connect a source to build your briefing.') };
}
export interface ToolRequest { id: string; operation: 'read' | 'write' | 'critical'; domain: Domain; }
// M0/M1 is read-only. Confirmation alone cannot enable an unimplemented write.
export function authorizeTool(request: ToolRequest, context: {authenticated: boolean; domains: Domain[]}) {
  return context.authenticated && context.domains.includes(request.domain) && request.operation === 'read';
}
export function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, /token|password|secret|authorization|cookie|code|payload|serial|customer|email/i.test(k) ? '[REDACTED]' : redact(v)]));
  // Free-form strings are excluded from audit metadata, avoiding embedded secrets.
  return typeof value === 'string' ? '[TEXT OMITTED]' : value;
}
