import {clock,type Locale} from '../../core/src/index.ts';
import type {PersonalData} from './model.ts';
import {agenda} from './planner.ts';
export type FoodSource='manual'|'cloud'|'file';
export interface FocusItem {id:string;title:string;detail:string;pane:'plan'|'journal'|'profile'|'connections';}
/** Deterministic navigation suggestions from verified inputs. No health prescriptions or inferred appointments. */
export function dailyFocus(data:PersonalData,now:Date,zone:string,locale:Locale,input:{sleep:number|null;sleepSource:string|null;food:number|null;foodSource:FoodSource}){
 const ar=locale==='ar',pick=(en:string,arabic:string)=>ar?arabic:en,today=clock(now,zone).date,plan=agenda(data.notes,today,zone,now),items:FocusItem[]=[],gaps:string[]=[];
 const sleep=input.sleep===null?pick('Sleep unavailable','النوم غير متاح'):input.sleepSource||pick('Recorded sleep','نوم مسجّل');
 const food=pick(input.foodSource==='cloud'?'ProgressXX cloud':input.foodSource==='file'?'ProgressXX file':'Manual food',input.foodSource==='cloud'?'سحابة ProgressXX':input.foodSource==='file'?'ملف ProgressXX':'أكل يدوي');
 const sources=pick(`Sleep: ${sleep}. Food: ${food}${input.food===null?' · unavailable':''}. Planner: recorded entries only.`,`النوم: ${sleep}. الأكل: ${food}${input.food===null?' · غير متاح':''}. الجدول: الإدخالات المسجّلة فقط.`);
 if(!data.profile)return {items,gaps,sources};
 const conflicts=plan.day.filter(n=>!n.done&&n.at&&Date.parse(n.at)+n.minutes*60000>+now&&plan.conflicts.has(n.id));
 if(conflicts.length)items.push({id:'conflicts',title:pick('Review overlapping recorded times','راجع المواعيد المسجّلة المتداخلة'),detail:pick(`${conflicts.length} of today’s recorded entries need overlap review. Check Planner before treating this time as free.`,`${conflicts.length} إدخالات من النهارده محتاجة مراجعة تداخل المواعيد. راجع الجدول قبل ما تعتبر الوقت ده فاضي.`),pane:'plan'});
 const next=plan.upcoming.find(n=>clock(new Date(n.at!),zone).date===today);
 if(next)items.push({id:'next',title:pick('Next recorded commitment today','التزامك الجاي المسجّل النهارده'),detail:`${clock(new Date(next.at!),zone,locale).time} · ${next.text}`,pane:'plan'});
 if(plan.due.length)items.push({id:'due',title:pick('Review due entries','راجع الإدخالات المستحقة'),detail:pick(`Due or overdue recorded reminders: ${plan.due.length}. Completion is not assumed.`,`تذكيرات مسجّلة مستحقة أو متأخرة: ${plan.due.length}. مش بنفترض إنها اتعملت.`),pane:'plan'});
 if(input.sleep===null){gaps.push(pick('No usable sleep reading is available today.','مفيش قراءة نوم قابلة للاستخدام للنهارده.'));items.push({id:'sleep',title:pick('Add a sleep check-in','سجّل نومك'),detail:gaps.at(-1)!,pane:'journal'});}
 if(input.food===null){gaps.push(pick('The selected food source has no usable total for today.','مصدر الأكل المختار مفيهوش مجموع متاح للنهارده.'));items.push({id:'food',title:input.foodSource==='manual'?pick('Record today’s food','سجّل أكل النهارده'):pick('Review the selected food source','راجع مصدر الأكل المختار'),detail:gaps.at(-1)!,pane:input.foodSource==='manual'?'journal':'connections'});}
 if(plan.floating.length)items.push({id:'notes',title:pick('Revisit your untimed notes','ارجع للنوتس اللي بدون موعد'),detail:pick(`Open untimed notes: ${plan.floating.length}. These are not calendar appointments.`,`${plan.floating.length} نوت مفتوحة بدون وقت مسجّل؛ مش مواعيد في الجدول.`),pane:'plan'});
 if(!items.length)items.push({id:'review',title:pick('Review your recorded plan','راجع خطتك المسجّلة'),detail:pick('No next step was inferred. Your recorded plan may be incomplete; add any real commitments.','مفيش خطوة تالية استنتجناها. خطتك المسجّلة ممكن تكون ناقصة؛ ضيف التزاماتك الحقيقية.'),pane:'plan'});
 return {items:items.slice(0,3),gaps,sources};
}
