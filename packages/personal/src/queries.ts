import {clock,type Locale} from '../../core/src/index.ts';
import {personalBriefing,type WhoopFacts} from './briefing.ts';
import {dailyFocus} from './daily-focus.ts';
import {nutritionView} from './planner.ts';
import type {PersonalData} from './model.ts';
import {progressSummary,type ProgressBackup} from '../../connectors/src/progress-backup.ts';
import type {LiveProgress} from '../../connectors/src/account-reader.ts';
export interface PersonalQueryContext {data:PersonalData;whoop:WhoopFacts|null;file:ProgressBackup|null;cloud:LiveProgress|null;useFile:boolean;useCloud:boolean;sleepPreference?:'auto'|'manual'|'whoop';unavailable:boolean;}
export type PersonalIntent='write-blocked'|'priorities'|'calories'|'sleep'|'next-workout'|'next'|'notes'|'day'|'recovery'|'energy'|'protein'|'exercise-history'|'weight';
function normalizeQuestion(input:string){
 return input.normalize('NFKC').toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
}
export function isClockQuestion(input:string){return /^(?:jarvis )?(?:what time is it|what is the time|current time|time now|time|الساعه كام(?: دلوقتي)?|الوقت|الوقت دلوقتي|كم الساعه)$/.test(normalizeQuestion(input));}
export function personalIntent(input:string):PersonalIntent|null{
 const s=normalizeQuestion(input);
 if(/\b(delete|erase|remove|create|add|update|overwrite)\b|(?:^|\s)(امسح|احذف|اضف|ضيف|عدل|انشئ)(?:\s|$)/u.test(s))return 'write-blocked';
 if(/\b(recovery|hrv|rhr|strain)\b|استشفا|تعافي|نبض الراحه|اجهاد ووب/.test(s))return 'recovery';
 if(/(?:energy|calories|kcal).*(?:burn|expend)|(?:burn|expend).*calories|حرقت كام|حرق ووب|سعرات الحرق|طاقه الدوره/.test(s))return 'energy';
 if(/\bprotein\b|بروتين/.test(s))return 'protein';
 if(/recent (?:exercise|workout)|last (?:exercise|workout)|exercise history|اخر تمارين|اخر تمرين|سجل التمارين/.test(s))return 'exercise-history';
 if(/weight trend|my weight|وزني|اتجاه الوزن|متوسط الوزن/.test(s))return 'weight';
 if(/what.*(start|first)|where.*start|next steps|priorit|ابدا بايه|اعمل ايه الاول|اولوياتي|اولويات/.test(s))return 'priorities';
 if(/(?:calories?|kcal).*(?:left|remaining)|remaining calories|how many.*calories.*left|فاضل.*(?:سعر|كالوري)|متبقي.*(?:سعر|كالوري)|اكلت كام|سعراتي/.test(s)||s==='calories')return 'calories';
 if(/how (?:long|many hours).*sleep|how did i sleep|my sleep|نمت (?:كام|قد ?ايه)|نومي|ساعات نومي/.test(s))return 'sleep';
 if(/next (?:workout|training)|(?:when|what time).*(?:workout|training)|workout.*امتي|امتي.*workout|(?:التمرين|تمريني) (?:امتي|الساعه)|موعد التمرين/.test(s))return 'next-workout';
 if(/next (?:appointment|meeting|commitment)|(?:when|what time).*(?:appointment|meeting)|موعدي الجاي|ميعادي الجاي|عندي ايه بعد كده/.test(s))return 'next';
 if(/my notes|untimed notes|نوتاتي|نوتس|ملاحظاتي/.test(s))return 'notes';
 if(/my day|summari[sz]e.*day|today.*tasks|tasks.*today|مهام.*النهارده|مهامي|لخص يومي|عندي ايه النهارده|my tasks|tasks today/.test(s))return 'day';
 return null;
}
/** Answers explicit supported reads from UI-held data. Never fetches, mutates, executes or calls a model. */
export function answerPersonalQuery(text:string,ctx:PersonalQueryContext|null,now:Date,zone:string,locale:Locale):string|null{
 const intent=personalIntent(text);if(!intent)return null;
 const ar=locale==='ar',pick=(en:string,arabic:string)=>ar?arabic:en;
 if(intent==='write-blocked')return pick('This chat does not create, edit or delete records. Open Planner or Check-in and review the change there.','المحادثة دي مش بتضيف أو بتعدّل أو بتمسح سجلات. افتح الجدول أو الإدخال اليومي وراجع التعديل هناك.');
 if(!ctx||ctx.unavailable)return pick('Your personal data is not ready. Unlock or reload the workspace before asking about saved records.','بياناتك الشخصية مش جاهزة. افتح مساحة العمل أو أعد تحميلها قبل السؤال عن السجلات.');
 const today=clock(now,zone).date,file=ctx.file?progressSummary(ctx.file,today,now):null;
 const currentCloud=ctx.cloud?.today===today&&+now-Date.parse(ctx.cloud.observedAt)>=0&&+now-Date.parse(ctx.cloud.observedAt)<=900000;
 const foodSource=ctx.useCloud?'cloud':ctx.useFile?'file':'manual';
 const nutrition=ctx.useCloud?(currentCloud?{food:ctx.cloud!.food?.calories??null,target:ctx.data.profile?.calorieTarget??null,current:true}:null):ctx.useFile&&file?{food:file.food?.calories??null,target:file.target,current:!file.stale}:null;
 const data=nutritionView(ctx.data,today,ctx.useCloud||ctx.useFile,nutrition),b=personalBriefing(data,now,zone,locale,ctx.whoop,ctx.sleepPreference??'auto');
 const focus=dailyFocus(ctx.data,now,zone,locale,{sleep:b.sleep,sleepSource:b.sleepSource,food:b.food,foodSource});
 const footer=pick('Saved-data answer · no model or write action.','إجابة من البيانات المحفوظة · بدون نموذج أو تعديل سجلات.');
 const source=ctx.useCloud?pick('ProgressXX cloud saved rows','سجلات ProgressXX السحابية المحفوظة'):ctx.useFile?pick('ProgressXX imported file','ملف ProgressXX المستورد'):pick('JARVIS manual check-in','إدخال جارفس اليدوي');
 const foodStamp=ctx.useCloud?ctx.cloud?.observedAt:ctx.useFile?ctx.file?.exportedAt:today;
 let answer='';
 const metric=(v:unknown,unit:string)=>typeof v==='number'&&Number.isFinite(v)?v.toFixed(1)+unit:pick('unavailable','غير متاح');
 if(intent==='recovery'||intent==='energy'){
  if(!b.whoopCurrent)answer=pick('No current WHOOP reading is available. Missing, future or stale data is not substituted.','مفيش قراءة WHOOP حديثة متاحة. البيانات الناقصة أو المستقبلية أو القديمة مش بنستبدلها بأرقام.');
  else if(intent==='recovery'){
   const d=ctx.whoop?.details;
   answer=pick('Saved WHOOP readings','قراءات WHOOP المحفوظة')+':\n'+pick('Recovery: ','الاستشفاء: ')+metric(ctx.whoop?.recovery,'%')+'\nHRV: '+metric(d?.hrv,' ms')+'\nRHR: '+metric(d?.rhr,' bpm')+'\n'+pick('Current-cycle strain: ','إجهاد الدورة الحالية: ')+metric(d?.cycle?.strain,' / 21');
   if(d?.calibrating)answer+='\n'+pick('WHOOP reports calibration is still in progress. No personal baseline or diagnosis is inferred.','WHOOP بيقول إن المعايرة لسه شغّالة. مش بنستنتج خط أساس شخصي أو تشخيص.');
  }else answer=pick('Current physiological-cycle energy estimate: ','تقدير طاقة الدورة الفسيولوجية الحالية: ')+metric(ctx.whoop?.details?.cycle?.energyKcal,' kcal')+'\n'+pick('This is expenditure, not food intake or a confirmed calendar-day total. It is never added to your food allowance.','ده إنفاق طاقة، مش أكل ولا إجمالي مؤكد لليوم التقويمي. مش بنضيفه لميزانية أكلك.');
  answer+='\n'+pick('Source: WHOOP Intelligence saved records.','المصدر: سجلات WHOOP Intelligence المحفوظة.')+(b.whoopCurrent?` · ${ctx.whoop?.observedAt} · ${pick('source sync','مزامنة المصدر')}: ${ctx.whoop?.lastSync}`:'');
 }
 if(intent==='protein'){
  const total=ctx.useCloud?(currentCloud?ctx.cloud?.food?.protein:null):ctx.useFile&&file&&!file.stale?file.food?.protein:null;
  answer=pick('Recorded protein today: ','البروتين المسجّل النهارده: ')+metric(total,' g')+'\n'+pick(`Source: ${source} · ${foodStamp||'unknown'}. No protein value is inferred from calories; manual check-ins contain no protein field.`,`المصدر: ${source} · ${foodStamp||'غير معروف'}. مش بنستنتج البروتين من السعرات؛ الإدخال اليدوي مفيهوش خانة بروتين.`);
 }
 if(intent==='exercise-history'||intent==='weight'){
  const progress=currentCloud?ctx.cloud:file&&!file.stale?file:null;
  const label=currentCloud?'ProgressXX cloud':'ProgressXX file';
  const issue=currentCloud&&ctx.cloud?.issues?.some(i=>i.dataset===(intent==='weight'?'weight':'workouts'));
  if(!progress||issue)answer=pick('This ProgressXX section is unavailable. No empty history or trend is inferred.','القسم ده من ProgressXX مش متاح. مش بنفترض إن السجل فاضي أو إن فيه اتجاه للوزن.');
  else if(intent==='exercise-history')answer=progress.recentWorkouts.length?progress.recentWorkouts.slice(0,3).map(w=>`${w.date} · ${w.exercise} · ${w.day} · ${w.status}`).join('\n')+'\n'+pick('These are saved exercise rows, not a count of completed training sessions.','دي صفوف تمارين محفوظة، مش عدد حصص تدريب مكتملة.'):pick('No recent exercise rows are available in this read scope. This does not prove no training occurred.','مفيش صفوف تمارين حديثة ضمن حدود القراءة. ده مش إثبات إنك متمرنتش.');
  else answer=pick('Current seven-day mean: ','متوسط آخر سبع أيام: ')+metric(progress.weight.current.mean,' kg')+` (${progress.weight.current.days} ${pick('measured days','أيام مقاسة')})`+'\n'+pick('Previous seven-day mean: ','متوسط السبع أيام السابقة: ')+metric(progress.weight.prior.mean,' kg')+` (${progress.weight.prior.days} ${pick('measured days','أيام مقاسة')})`+'\n'+pick('Mean change: ','فرق المتوسط: ')+metric(progress.weight.delta,' kg')+'\n'+pick('A trend needs at least three measured days in each comparison week; this is not body-fat change.','الاتجاه محتاج تلات أيام مقاسة على الأقل في كل أسبوع مقارنة؛ ده مش قياس لتغير دهون الجسم.');
  answer+='\n'+pick('Source: ','المصدر: ')+(progress?label:pick('unavailable','غير متاح'))+(progress?` · ${progress.exportedAt}`:'');
 }
 if(intent==='priorities')answer=focus.items.length?focus.items.map((item,i)=>`${i+1}. ${item.title}: ${item.detail}`).join('\n')+'\n'+focus.sources:pick('Complete your profile first. No priorities were inferred.','كمّل ملفك الأول. مفيش أولويات استنتجناها.');
 if(intent==='calories'){
  answer=b.food===null?pick('No usable food total is available for today. No remaining calories can be calculated.','مفيش مجموع أكل متاح للنهارده. مش هقدر أحسب السعرات المتبقية.'):pick(`Recorded food: ${b.food.toFixed(0)} kcal.`,`الأكل المسجّل: ${b.food.toFixed(0)} kcal.`);
  if(b.food!==null)answer+=' '+(b.target===null?pick('No usable chosen calorie target is available.','مفيش هدف سعرات مختار ومتاح.'):b.over?pick(`Recorded food exceeds your chosen target by ${b.over.toFixed(0)} kcal.`,`الأكل المسجّل أعلى من هدفك المختار بـ ${b.over.toFixed(0)} kcal.`):pick(`${b.remaining!.toFixed(0)} kcal remain against your chosen target and logged food only.`, `المتبقي ${b.remaining!.toFixed(0)} kcal مقارنة بهدفك المختار والأكل المسجّل فقط.`));
  answer+='\n'+pick(`Source: ${source} · ${foodStamp||'unknown'}. Diary completeness is not inferred.`,`المصدر: ${source} · ${foodStamp||'غير معروف'}. مش بنفترض إن سجل الأكل مكتمل.`);
 }
 if(intent==='sleep')answer=(b.sleep===null?pick('No usable sleep reading is available for today. Stale WHOOP readings are not used.','مفيش قراءة نوم متاحة للنهارده. قراءات WHOOP القديمة مش مستخدمة.'):pick(`Recorded sleep: ${b.sleep.toFixed(1)} hours (${b.sleepSource}).`,`نومك المسجّل: ${b.sleep.toFixed(1)} ساعة (${b.sleepSource}).`)+(b.sleepTarget===null?'':pick(` Reference: ${b.sleepTarget.toFixed(1)} hours (${b.sleepTargetSource}).`,` المرجع: ${b.sleepTarget.toFixed(1)} ساعة (${b.sleepTargetSource}).`)))+'\n'+(b.sleepSource==='WHOOP'?pick(`Last read: ${ctx.whoop?.observedAt}; last complete source sync: ${ctx.whoop?.lastSync}.`,`آخر قراءة: ${ctx.whoop?.observedAt}؛ آخر مزامنة مصدر مكتملة: ${ctx.whoop?.lastSync}.`):b.sleep!==null?pick(`Source: JARVIS dated check-in · ${today}.`,`المصدر: إدخال جارفس حسب التاريخ · ${today}.`):pick('Source: unavailable. Check Sources or add a manual check-in.','المصدر: غير متاح. راجع المصادر أو سجّل إدخال يدوي.'));
 if(intent==='next'||intent==='next-workout'){
  const next=ctx.data.notes.filter(n=>!n.done&&n.at&&Date.parse(n.at)>+now&&(intent!=='next-workout'||n.kind==='workout')).sort((a,b)=>Date.parse(a.at!)-Date.parse(b.at!))[0];
  if(next)answer=`${next.text} · ${new Intl.DateTimeFormat(ar?'ar-EG':'en-GB',{timeZone:zone,dateStyle:'short',timeStyle:'short'}).format(new Date(next.at!))} · ${zone}\n`+pick('Source: JARVIS Planner · recorded time only.','المصدر: جدول جارفس · الموعد المسجّل فقط.');
  else{answer=intent==='next-workout'?pick('No future timed workout is recorded in JARVIS Planner.','مفيش تمرين جاي بموعد مسجّل في جدول جارفس.'):pick('No future timed commitment is recorded. This does not prove you are free.','مفيش التزام جاي بموعد مسجّل. ده مش إثبات إنك فاضي.');
   if(intent==='next-workout'){const label=currentCloud?ctx.cloud?.scheduledDay:file&&!file.stale?file.scheduledDay:null;if(label)answer+='\n'+pick(`Saved weekday label: ${label}. It has no appointment time. Source: ${currentCloud?'ProgressXX cloud':'ProgressXX file'}.`,`اسم تدريب اليوم المحفوظ: ${label}. بدون موعد مؤكد. المصدر: ${currentCloud?'سحابة ProgressXX':'ملف ProgressXX'}.`);}
  }
 }
 if(intent==='notes'){const notes=ctx.data.notes.filter(n=>!n.done&&!n.at).slice().reverse();answer=notes.length?notes.slice(0,3).map((n,i)=>`${i+1}. ${n.text}`).join('\n')+'\n'+pick(`Source: JARVIS Planner. Open untimed notes: ${notes.length}; these are not appointments.`,`المصدر: جدول جارفس. نوتس مفتوحة بدون موعد: ${notes.length}؛ دي مش مواعيد.`):pick('No open untimed notes are recorded. Source: JARVIS Planner.','مفيش نوتس مفتوحة بدون موعد مسجّلة. المصدر: جدول جارفس.');}
 if(intent==='day')answer=[b.greeting,ctx.data.profile?.name,...b.lines,...focus.gaps,focus.sources].filter(Boolean).join('\n');
 return answer+'\n'+footer;
}
