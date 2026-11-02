import type {PersonalData} from './model.ts';
export function firstUseStatus(data:PersonalData,context:{persistent:boolean;sessionAcknowledged:boolean;sleep:number|null;food:number|null}){
 const steps=[{id:'profile',done:data.profile!==null},{id:'storage',done:context.persistent||context.sessionAcknowledged},{id:'sleep',done:context.sleep!==null},{id:'food',done:context.food!==null},{id:'entry',done:data.notes.length>0}];
 return {steps,completed:steps.filter(s=>s.done).length,total:steps.length};
}
