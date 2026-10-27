export interface Profile {name:string;goal:string;interests:string;sleepTarget:number;calorieTarget:number|null;dayStart:string;dayEnd:string;}
export interface DayEntry {date:string;sleepHours:number|null;foodKcal:number|null;foodComplete:boolean;scheduleComplete:boolean;}
export interface PersonalNote {id:string;text:string;kind:'note'|'task'|'workout';at:string|null;minutes:number;done:boolean;}
export interface PersonalData {profile:Profile|null;days:DayEntry[];notes:PersonalNote[];}
export interface PersonalState {revision:number;data:PersonalData;persistent:boolean;}
export const emptyData=():PersonalData=>({profile:null,days:[],notes:[]});
const object=(v:unknown):Record<string,any>=>{if(!v||typeof v!=='object'||Array.isArray(v))throw Error('Invalid object');return v as Record<string,any>;};
const text=(v:unknown,max:number)=>{if(typeof v!=='string'||v.length>max)throw Error('Invalid text');return v.trim();};
const number=(v:unknown,min:number,max:number)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw Error('Invalid number');return v;};
const nullable=(v:unknown,min:number,max:number)=>v===null?null:number(v,min,max);
export function validDate(value:string){return /^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;}
export function validateData(input:unknown):PersonalData {
  const v=object(input);let profile:Profile|null=null;
  if(v.profile!==null){const p=object(v.profile);const dayStart=text(p.dayStart,5),dayEnd=text(p.dayEnd,5);
    if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(dayStart)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(dayEnd)||dayEnd<=dayStart)throw Error('Invalid day window');
    profile={name:text(p.name,60),goal:text(p.goal,120),interests:text(p.interests,200),sleepTarget:number(p.sleepTarget,7,9),calorieTarget:nullable(p.calorieTarget,800,10000),dayStart,dayEnd};
    if(!profile.name)throw Error('Name required');
  }
  if(!Array.isArray(v.days)||v.days.length>90||!Array.isArray(v.notes)||v.notes.length>200)throw Error('Too many records');
  const dates=new Set<string>(),ids=new Set<string>();
  const days=v.days.map((item:unknown)=>{const d=object(item),date=text(d.date,10);if(!validDate(date)||dates.has(date)||typeof d.foodComplete!=='boolean'||typeof d.scheduleComplete!=='boolean')throw Error('Invalid day');dates.add(date);
    return {date,sleepHours:nullable(d.sleepHours,0,24),foodKcal:nullable(d.foodKcal,0,20000),foodComplete:d.foodComplete,scheduleComplete:d.scheduleComplete};});
  const notes=v.notes.map((item:unknown)=>{const n=object(item),id=text(n.id,80);if(!/^[\w-]+$/.test(id)||ids.has(id)||!['note','task','workout'].includes(n.kind)||typeof n.done!=='boolean')throw Error('Invalid note');ids.add(id);
    const at=n.at===null?null:text(n.at,40);if(at!==null&&!/^\d{4}-\d{2}-\d{2}T.*Z$/.test(at)||at!==null&&!Number.isFinite(Date.parse(at)))throw Error('Invalid timestamp');
    if(n.kind!=='note'&&at===null)throw Error('Task time required');
    const body=text(n.text,400);if(!body)throw Error('Empty note');
    return {id,text:body,kind:n.kind,at,minutes:number(n.minutes,1,600),done:n.done} as PersonalNote;});
  return {profile,days,notes};
}
/** Reject ambiguous/nonexistent DST times instead of silently scheduling the wrong hour. */
export function localInstant(local:string,zone:string):string {
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)||!validDate(local.slice(0,10)))throw Error('Invalid local date');
  const nominal=Date.parse(local+':00Z');if(!Number.isFinite(nominal))throw Error('Invalid local time');
  const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:zone,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});
  const wall=(stamp:number)=>{const p=fmt.formatToParts(new Date(stamp));const get=(k:string)=>p.find(x=>x.type===k)!.value;return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;};
  const offsets=new Set<number>();for(let h=-36;h<=36;h+=6){const stamp=nominal+h*3600000;offsets.add(Date.parse(wall(stamp)+':00Z')-stamp);}
  const matches=[...offsets].map(offset=>nominal-offset).filter(stamp=>wall(stamp)===local);
  if(matches.length!==1)throw Error('This local time is ambiguous or does not exist. Choose another time.');
  return new Date(matches[0]).toISOString();
}
