import React from 'react';
import type {dailyFocus} from '../../../packages/personal/src/daily-focus.ts';
export function DailyFocus({value,ar,onPane}:{value:ReturnType<typeof dailyFocus>;ar:boolean;onPane:(pane:string)=>void}){
 if(!value.items.length)return null;
 return <section className="daily-focus" aria-label={ar?'خطوات يومك المسجّلة':'Recorded next steps'}><div className="section-heading"><h3>{ar?'ابدأ من هنا':'Start here'}</h3><span>{ar?'من البيانات المسجّلة فقط':'Recorded data only'}</span></div><ol>{value.items.map(item=><li key={item.id}><div><strong>{item.title}</strong><p>{item.detail}</p></div><button type="button" className="secondary" onClick={()=>onPane(item.pane)} aria-label={`${ar?'افتح':'Open'}: ${item.title}`}>{ar?'افتح':'Open'} ↗</button></li>)}</ol><p className="source-note">{value.sources}</p></section>;
}
