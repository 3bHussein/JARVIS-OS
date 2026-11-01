import type {PersonalNote} from './model.ts';
export const reminderGraceMs=5*60000;
/** Open-workspace reminder window. Never replay events that predate explicit arming. */
export function dueReminders(notes:PersonalNote[],now:number,armedAt:number,delivered:ReadonlySet<string>){
 if(!Number.isFinite(now)||!Number.isFinite(armedAt)||now<armedAt)return [];
 return notes.filter(n=>!n.done&&n.at!==null).map(note=>({note,key:JSON.stringify([note.id,note.at]),stamp:Date.parse(note.at!)})).filter(v=>Number.isFinite(v.stamp)&&v.stamp>=armedAt&&v.stamp<=now&&now-v.stamp<=reminderGraceMs&&!delivered.has(v.key)).sort((a,b)=>a.stamp-b.stamp||a.note.id.localeCompare(b.note.id));
}
