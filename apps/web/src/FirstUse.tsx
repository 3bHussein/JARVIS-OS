import React from 'react';
import type {PersonalData} from '../../../packages/personal/src/model.ts';
import {firstUseStatus} from '../../../packages/personal/src/first-use.ts';
export function FirstUse({data,persistent,available,acknowledged,sleep,food,busy,ar,onPersist,onSession,onPane}:{data:PersonalData;persistent:boolean;available:boolean;acknowledged:boolean;sleep:number|null;food:number|null;busy:boolean;ar:boolean;onPersist:()=>void;onSession:()=>void;onPane:(pane:string)=>void}){
 const pick=(en:string,arabic:string)=>ar?arabic:en,s=firstUseStatus(data,{persistent,sessionAcknowledged:acknowledged,sleep,food});
 const labels:Record<string,[string,string,string]>={profile:['Your editable profile','ملفك القابل للتعديل','profile'],storage:[persistent?'Encrypted saving enabled':acknowledged?'Session-only chosen':'Choose how to save',persistent?'الحفظ المشفّر مفعّل':acknowledged?'اخترت الحفظ للجلسة':'اختار طريقة الحفظ','profile'],sleep:['A recorded sleep value','قيمة نوم مسجّلة','journal'],food:['A recorded food value','قيمة أكل مسجّلة','journal'],entry:['Your first note or commitment','أول نوت أو التزام تسجّله','plan']};
 const next=s.steps.find(step=>!step.done);
 return <section className="first-use">
  <div className="panel setup-card">
    <div className="setup-header">
      <div>
        <h3>{pick('Get started','ابدأ مع جارفس')}</h3>
        <p>{next?labels[next.id][ar?1:0]:pick('Setup checklist complete','خطوات البداية اكتملت')}</p>
      </div>
      {next&&<button className="primary" onClick={()=>onPane(labels[next.id][2])}>{pick('Go to next step','افتح الخطوة الجاية')}</button>}
    </div>
    <div className="setup-progress">
      <progress aria-label={pick('Setup progress','تقدّم الإعداد')} value={s.completed} max={s.total}/>
      <span>{s.completed} / {s.total}</span>
    </div>
    <details>
      <summary>{pick('View all steps','شوف كل الخطوات')}</summary>
      <ol className="setup-steps">{s.steps.map(step=><li key={step.id}>
        <span aria-label={step.done?pick('Recorded or chosen','مسجّل أو مختار'):pick('Not recorded yet','لسه مش مسجّل')}>{step.done?'✓':'○'}</span>
        <strong>{labels[step.id][ar?1:0]}</strong>
        <button aria-label={labels[step.id][ar?1:0]} onClick={()=>onPane(labels[step.id][2])}>{pick('Open','افتح')}</button>
      </li>)}</ol>
      <button onClick={()=>onPane('connections')}>{pick('Connect WHOOP / import ProgressXX','وصّل WHOOP / استورد ProgressXX')}</button>
    </details>
  </div>
{!persistent&&!acknowledged&&<div className="storage-choice notice" role="status"><strong>{pick('Your current data is session-only','بياناتك الحالية للجلسة فقط')}</strong><p>{pick('Locking or closing without encrypted saving can discard these session edits. Choose explicitly: encrypted saving includes your JARVIS profile, notes and manual check-ins, never WHOOP tokens or imported files.','القفل أو الإغلاق من غير حفظ مشفّر ممكن يضيّع تعديلات الجلسة. اختار صراحةً: الحفظ المشفّر بيشمل ملف جارفس والنوتس والإدخالات اليدوية، مش توكنات WHOOP أو الملفات المستوردة.')}</p><button className="primary" disabled={busy||!available} onClick={onPersist}>{pick('Save current data encrypted','احفظ البيانات الحالية مشفّرة')}</button><button disabled={busy} onClick={onSession}>{pick('Continue session-only','كمّل للجلسة فقط')}</button>{!available&&<p>{pick('Encrypted storage is unavailable here. Session-only is still available.','الحفظ المشفّر غير متاح هنا. تقدر تكمل للجلسة فقط.')}</p>}</div>}</section>;
}
