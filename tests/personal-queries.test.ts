import {test} from 'node:test';
import assert from 'node:assert/strict';
import {personalIntent,isClockQuestion,answerPersonalQuery,type PersonalQueryContext} from '../packages/personal/src/queries.ts';
import {emptyData} from '../packages/personal/src/model.ts';
import {progressSummary} from '../packages/connectors/src/progress-backup.ts';
const now=new Date('2026-11-10T12:00:00Z'),zone='Africa/Cairo';
function context():PersonalQueryContext{return {data:{...emptyData(),profile:{name:'Synthetic',goal:'',interests:'',sleepTarget:8,calorieTarget:2400,dayStart:'08:00',dayEnd:'22:00'},days:[{date:'2026-11-10',sleepHours:6,foodKcal:1400,scheduleComplete:false,foodComplete:false}]},whoop:null,file:null,cloud:null,useFile:false,useCloud:false,unavailable:false};}
test('QUERY-01 supported Egyptian/English wording, Arabic normalization and safe unknown intent',()=>{
 for(const [text,intent]of [['What time is my workout?','next-workout'],['workout امتى','next-workout'],['What time is my next appointment?','next'],['أبدأ بإيه؟','priorities'],['what should I start with?','priorities'],['فاضل كام سعر؟','calories'],['How many calories are left?','calories'],['نمت قدإيه','sleep'],['نمت كام ساعة','sleep'],['التمرين امتى؟','next-workout'],['موعدي الجاي','next'],['ملاحظاتي','notes'],['لخص يومي','day']])assert.equal(personalIntent(text),intent);
 assert.equal(isClockQuestion('What time is it?'),true);assert.equal(isClockQuestion('الساعة كام؟'),true);assert.equal(isClockQuestion('What time is my workout?'),false);
 assert.equal(personalIntent('Recommend a sodium dose for strength'),null);
 assert.equal(personalIntent('Who is the president?'),null);
});
test('QUERY-02 writes are refused even with read keywords; unknown does not fall through to a guessed answer',()=>{
 const ctx=context(),before=structuredClone(ctx);
 for(const text of ['Delete all notes today','امسح مهام النهارده','add workout tomorrow'])assert.match(answerPersonalQuery(text,ctx,now,zone,'en')!,/does not create/);
 assert.deepEqual(ctx,before);assert.equal(answerPersonalQuery('unsupported subject',ctx,now,zone,'en'),null);
 assert.match(answerPersonalQuery('my sleep',null,now,zone,'en')!,/not ready/);
 assert.match(answerPersonalQuery('my sleep',{...ctx,unavailable:true},now,zone,'en')!,/not ready/);
});
test('QUERY-03 arithmetic respects selected source, zero/unknown, excess and missing target',()=>{
 const ctx=context();assert.match(answerPersonalQuery('فاضل كام سعر',ctx,now,zone,'ar')!,/1000 kcal/);
 ctx.data.days[0].foodKcal=0;assert.match(answerPersonalQuery('calories',ctx,now,zone,'en')!,/2400 kcal remain/);
 ctx.data.days[0].foodKcal=2700;assert.match(answerPersonalQuery('calories',ctx,now,zone,'en')!,/exceeds.*300 kcal/);
 ctx.data.profile!.calorieTarget=null;assert.match(answerPersonalQuery('calories',ctx,now,zone,'en')!,/No usable chosen/);
 ctx.useCloud=true;const absent=answerPersonalQuery('calories',ctx,now,zone,'en')!;assert.match(absent,/No usable food total/);assert.match(absent,/ProgressXX cloud/);assert.equal(absent.includes('2700'),false);
});
test('QUERY-04 recomputes date and freshness at question time, never serves yesterday/stale WHOOP as current',()=>{
 const ctx=context();ctx.whoop={date:'2026-11-10',sleepHours:8,sleepNeedHours:9,recovery:70,observedAt:now.toISOString(),lastSync:now.toISOString()};
 assert.match(answerPersonalQuery('my sleep',ctx,now,zone,'en')!,/8.0 hours \(WHOOP\)/);
 assert.match(answerPersonalQuery('my sleep',ctx,new Date(+now+900001),zone,'en')!,/6.0 hours \(Self-reported\)/);
 assert.match(answerPersonalQuery('my sleep',ctx,new Date('2026-11-11T12:00:00Z'),zone,'en')!,/No usable sleep/);
});
test('QUERY-05 appointments are dated and untimed workout labels never invent time',()=>{
 const ctx=context();ctx.data.notes=[{id:'workout',text:'Synthetic workout',kind:'workout',at:'2026-11-11T13:00:00Z',minutes:60,done:false},{id:'done',text:'Completed',kind:'task',at:'2026-11-10T13:00:00Z',minutes:30,done:true}];
 const answer=answerPersonalQuery('When is my next workout?',ctx,now,zone,'en')!;assert.match(answer,/11\/11\/2026.*15:00/);assert.match(answer,/JARVIS Planner/);assert.equal(answer.includes('Completed'),false);
 ctx.data.notes=[];ctx.cloud={...progressSummary({exportedAt:now.toISOString(),target:null,foods:[],weights:[],workouts:[],schedule:{tue:'Upper'}},'2026-11-10',now),source:'progressxx-cloud',observedAt:now.toISOString(),coverage:[]};
 const label=answerPersonalQuery('التمرين امتى',ctx,now,zone,'ar')!;assert.match(label,/Upper/);assert.match(label,/بدون موعد مؤكد/);
 assert.match(answerPersonalQuery('next appointment',ctx,now,zone,'en')!,/does not prove you are free/);
});
test('QUERY-06 notes are bounded, read-only and profile/health provenance stays within the explicit local answer',()=>{
 const ctx=context();ctx.data.notes=Array.from({length:6},(_,i)=>({id:String(i),text:'Synthetic note '+i,kind:'note',at:null,minutes:30,done:false}));const before=structuredClone(ctx);
 const answer=answerPersonalQuery('my notes',ctx,now,zone,'en')!;assert.match(answer,/Synthetic note 5/);assert.equal(answer.includes('Synthetic note 2'),false);assert.match(answer,/notes: 6/);assert.match(answer,/no model or write/);assert.deepEqual(ctx,before);
 assert.match(answerPersonalQuery('What should I start with?',ctx,now,zone,'en')!,/JARVIS|Planner/);
});
