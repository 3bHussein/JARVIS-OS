import {clock} from '../../core/src/index.ts';
import {validDate,type PersonalNote,type PersonalData} from './model.ts';
export function shiftDay(date:string,days:number){if(!validDate(date)||!Number.isInteger(days))throw Error('invalid_date');return new Date(Date.parse(date+'T12:00:00Z')+days*86400000).toISOString().slice(0,10);}
export function localDateTime(instant:string,zone:string){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:zone,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).formatToParts(new Date(instant)),get=(key:string)=>parts.find(p=>p.type===key)!.value;return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;}
export function agenda(notes:PersonalNote[],date:string,zone:string,now:Date){
  if(!validDate(date))throw Error('invalid_date');
  const day=notes.filter(n=>n.at&&clock(new Date(n.at),zone).date===date).sort((a,b)=>Date.parse(a.at!)-Date.parse(b.at!)||a.id.localeCompare(b.id));
  const reserved=notes.filter(n=>n.at&&n.kind!=='note'&&!n.done),conflicts=new Set<string>();
  for(let i=0;i<reserved.length;i++)for(let j=i+1;j<reserved.length;j++){const a=reserved[i],b=reserved[j],sa=Date.parse(a.at!),sb=Date.parse(b.at!);if(sa<sb+b.minutes*60000&&sb<sa+a.minutes*60000){conflicts.add(a.id);conflicts.add(b.id);}}
  return {day,conflicts,due:notes.filter(n=>n.at&&!n.done&&Date.parse(n.at)<=+now).sort((a,b)=>Date.parse(a.at!)-Date.parse(b.at!)),floating:notes.filter(n=>!n.at&&!n.done),upcoming:notes.filter(n=>n.at&&!n.done&&Date.parse(n.at)>+now).sort((a,b)=>Date.parse(a.at!)-Date.parse(b.at!)).slice(0,3)};
}
export function journalCoverage(data:PersonalData,today:string){return Array.from({length:7},(_,i)=>{const date=shiftDay(today,i-6);return {date,entry:data.days.find(d=>d.date===date)??null};});}
/** Transient source selection; never mutate the saved manual journal. */
export function nutritionView(data:PersonalData,date:string,selected:boolean,snapshot:{food:number|null;target:number|null;current:boolean}|null):PersonalData {
  if(!selected)return data;
  const current=snapshot?.current===true,entry=data.days.find(d=>d.date===date);
  return {...data,profile:data.profile?{...data.profile,calorieTarget:current?snapshot!.target:null}:null,days:[...data.days.filter(d=>d.date!==date),{date,sleepHours:entry?.sleepHours??null,scheduleComplete:entry?.scheduleComplete??false,foodKcal:current?snapshot!.food:null,foodComplete:false}]};
}
