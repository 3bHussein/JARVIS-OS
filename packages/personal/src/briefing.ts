import {clock,type Locale} from '../../core/src/index.ts';
import {localInstant,type PersonalData} from './model.ts';
export interface WhoopFacts {sleepHours:number|null;sleepNeedHours:number|null;recovery:number|null;observedAt:string|null;lastSync:string|null;date:string;}
export const science={sleep:'https://www.cdc.gov/sleep/about/index.html',recovery:'https://pubmed.ncbi.nlm.nih.gov/28247026/',sodium:'https://www.ausport.gov.au/ais/nutrition/supplements/group_a/sports-foods2/electrolyte-supplement2/how-and-when-do-i-use-it'};
export function personalBriefing(data:PersonalData,now:Date,zone:string,locale:Locale,whoop:WhoopFacts|null=null){
  const c=clock(now,zone,locale),day=data.days.find(d=>d.date===c.date),ar=locale==='ar';
  const whoopCurrent=whoop?.date===c.date&&whoop.observedAt&&whoop.lastSync&&now.getTime()-Date.parse(whoop.lastSync)>=0&&now.getTime()-Date.parse(whoop.lastSync)<=86400000&&now.getTime()-Date.parse(whoop.observedAt)>=0&&now.getTime()-Date.parse(whoop.observedAt)<=900000;
  const sleep=whoopCurrent&&whoop!.sleepHours!==null?whoop!.sleepHours:day?.sleepHours??null;
  const sleepSource=whoopCurrent&&whoop!.sleepHours!==null?'WHOOP':sleep!==null?(ar?'إدخال يدوي':'Self-reported'):null;
  const target=data.profile?.calorieTarget??null,food=day?.foodKcal??null;
  const remaining=target!==null&&food!==null?Math.max(0,target-food):null,over=target!==null&&food!==null?Math.max(0,food-target):null;
  const due=data.notes.filter(n=>!n.done&&n.at!==null&&Date.parse(n.at)<=+now).sort((a,b)=>Date.parse(a.at!)-Date.parse(b.at!));
  const upcoming=data.notes.filter(n=>!n.done&&n.at!==null&&Date.parse(n.at)>+now&&clock(new Date(n.at),zone).date===c.date).sort((a,b)=>Date.parse(a.at!)-Date.parse(b.at!));
  const lines:string[]=[];
  const sleepTarget=whoopCurrent&&whoop!.sleepNeedHours!==null?whoop!.sleepNeedHours:data.profile?.sleepTarget??null;
  const sleepTargetSource=whoopCurrent&&whoop!.sleepNeedHours!==null?(ar?'احتياج WHOOP المقدّر':'WHOOP estimate'):ar?'هدفك المختار':'your chosen target';
  if(sleep!==null)lines.push(ar?`نومك المسجّل ${sleep.toFixed(1)} ساعة (${sleepSource})${sleepTarget===null?'':`؛ المرجع ${sleepTarget.toFixed(1)} ساعة (${sleepTargetSource})`}.`:`Recorded sleep: ${sleep.toFixed(1)} hours (${sleepSource})${sleepTarget===null?'':`; reference ${sleepTarget.toFixed(1)} hours (${sleepTargetSource})`}.`);
  if(remaining!==null)lines.push(ar?`المتبقي من هدفك المُدخل ${remaining.toFixed(0)} kcal مقارنة بالأكل المسجّل${day?.foodComplete?'':' فقط؛ اليوم غير مكتمل'}.`:`${remaining.toFixed(0)} kcal remain against your entered target and logged food${day?.foodComplete?'':' only; diary incomplete'}.`);
  if(upcoming[0])lines.push(`${upcoming[0].text} · ${clock(new Date(upcoming[0].at!),zone,locale).time}`);
  if(due.length)lines.push(ar?`عندك ${due.length} تذكير مستحق أو متأخر.`:`${due.length} reminders are due or overdue.`);
  let freeSlot:{at:string;minutes:number}|null=null;
  if(day?.scheduleComplete&&data.profile){
    try{let start=Math.max(+now,Date.parse(localInstant(`${c.date}T${data.profile.dayStart}`,zone))),end=Date.parse(localInstant(`${c.date}T${data.profile.dayEnd}`,zone));
      start=Math.ceil(start/900000)*900000;
      const busy=data.notes.filter(n=>n.at&&n.kind!=='note').map(n=>({start:Date.parse(n.at!),end:Date.parse(n.at!)+n.minutes*60000})).sort((a,b)=>a.start-b.start);
      for(const b of busy){if(b.end<=start||b.start>=end)continue;if(b.start-start>=900000){end=Math.min(end,b.start);break;}start=Math.max(start,b.end);}
      if(end-start>=900000)freeSlot={at:new Date(start).toISOString(),minutes:Math.min(30,Math.floor((end-start)/60000))};
    }catch{}
  }
  const training=sleep!==null&&sleep<7?(ar?'النوم المسجّل أقل من مرجع ٧ ساعات للبالغين. قيّم نعاسك وأداء الإحماء؛ لو مش مستعد، اختار مشي خفيف أو تدريب تقنية مريح وأجّل المحاولات القصوى. ساعات النوم وحدها لا تحدد تمرينًا أو نسبة تخفيف أو مدة دقيقة.':'Recorded sleep is below the general adult 7-hour reference. Check sleepiness and warm-up performance; if not ready, consider easy walking or comfortable technique practice and defer maximal attempts. Sleep hours alone do not determine an exercise, exact load reduction or session duration.'):null;
  return {...c,lines,sleep,sleepTarget,sleepTargetSource,sleepSource,remaining,over,food,target,due,upcoming,freeSlot,training,foodComplete:day?.foodComplete??false,whoopCurrent:Boolean(whoopCurrent),reading:freeSlot&&data.profile?.interests?(ar?`لو الفترة دي مناسبة فعلًا، خصص ١٠ دقائق للقراءة أو التعلّم عن: ${data.profile.interests}. دي فترة غير محجوزة في الجدول اللي أكدت اكتماله، مش تأكيد إنك فاضي.`:`If this slot really suits you, spend 10 minutes reading or learning about: ${data.profile.interests}. This is unbooked in the schedule you marked complete, not proof you are free.`):null};
}
