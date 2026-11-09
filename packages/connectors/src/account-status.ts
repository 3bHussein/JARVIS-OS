export interface AccountStatus {connected:boolean;expiresAt:number|null;lastRead:string|null;}
/** Presentation only: a connected grant never means the device/source has synchronized. */
export function accountStatus(value:AccountStatus|undefined,now=Date.now()){
 const expiry=typeof value?.expiresAt==='number'&&Number.isFinite(value.expiresAt)?value.expiresAt:null;
 const connected=value?.connected===true&&expiry!==null&&expiry>now;
 const stamp=typeof value?.lastRead==='string'?Date.parse(value.lastRead):NaN;
 const lastRead=Number.isFinite(stamp)&&stamp<=now?value!.lastRead:null;
 return {connected,expired:expiry!==null&&expiry<=now,expiresAt:expiry,lastRead,minutes:connected?Math.ceil((expiry!-now)/60000):null,readState:lastRead?(now-stamp<=900000?'recent':'old'):'unread'} as const;
}
export function sourceReadMessage(code:string,ar:boolean):string|null{
 const messages:Record<string,[string,string]>={
  expired:['Source session expired. Reconnect in Sources; your JARVIS records are unchanged.','جلسة المصدر انتهت. اربط تاني من المصادر؛ سجلات جارفس زي ما هي.'],
  not_linked:['Link WHOOP in the original WHOOP Intelligence app first, synchronize there, then read here.','اربط WHOOP من تطبيق WHOOP Intelligence الأصلي الأول، وحدّث هناك، وبعدها اقرأ هنا.'],
  busy:['A read is already running. Wait a moment, then retry.','في قراءة شغّالة بالفعل. استنى لحظة وجرّب تاني.'],
  source_rate_limited:['Too many requests. Wait a minute, then retry saved-record reading.','طلبات كتير. استنى دقيقة وجرّب قراءة السجلات تاني.'],
  source_result_limit:['The bounded read reached its row limit. No partial total is shown; use the original app while this is reviewed.','القراءة وصلت لحد السجلات. مش هنعرض مجموع ناقص؛ استخدم التطبيق الأصلي لحد مراجعة السبب.'],
  source_invalid_response:['Some source fields are missing or invalid. No partial total is shown; check the original app.','في حقول ناقصة أو غير صالحة من المصدر. مش هنعرض مجموع ناقص؛ راجع التطبيق الأصلي.'],
  source_unavailable:['Cannot read saved records now. Check your connection or the original app, then retry; no sample data is substituted.','مش قادرين نقرأ السجلات دلوقتي. راجع الاتصال أو التطبيق الأصلي وجرّب تاني؛ مفيش أرقام تجريبية بديلة.'],
 };
 if(['connected','disconnected'].includes(code))return null;
 const key=['whoop_session_expired','source_session_expired'].includes(code)?'expired':code==='source_read_in_progress'?'busy':code;
 return (messages[key]??messages.source_unavailable)[ar?1:0];
}
export function sourceTime(value:string|number,zone:string,ar:boolean){return new Intl.DateTimeFormat(ar?'ar-EG':'en-GB',{timeZone:zone,dateStyle:'short',timeStyle:'short'}).format(new Date(value));}
