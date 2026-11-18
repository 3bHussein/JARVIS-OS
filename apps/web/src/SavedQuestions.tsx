import React,{useState} from 'react';
import {findSavedQuestions,savedQuestions} from '../../../packages/personal/src/questions.ts';
export function SavedQuestions({ar,disabled,onChoose}:{ar:boolean;disabled:boolean;onChoose:(text:string)=>void}){
 const [search,setSearch]=useState('');const pick=(en:string,arabic:string)=>ar?arabic:en;
 const groups=[['day','Your day','يومك'],['nutrition','Food','الأكل'],['health','Fitness and sleep','التمارين والنوم']] as const;
 const matches=findSavedQuestions(search);
 return <div className="saved-questions"><div className="query-shortcuts" aria-label={pick('Saved-data question suggestions','اقتراحات أسئلة البيانات المحفوظة')}>{savedQuestions.slice(0,3).map(q=><button type="button" key={q.id} disabled={disabled} onClick={()=>onChoose(ar?q.ar:q.en)}>{ar?q.ar:q.en}</button>)}</div>
 <details className="question-library"><summary>{pick('More questions · free saved-data answers','أسئلة أكتر · إجابات مجانية من بياناتك')}</summary><p>{pick('Choose a question, review the draft, then Send. Answers need available, current sources; this is not general AI or automatic synchronization.','اختار سؤال وراجع النص وبعدين إرسال. الإجابة محتاجة مصدر متاح وحديث؛ دي مش محادثة ذكاء عام أو مزامنة تلقائية.')}</p><label>{pick('Find a supported question','دور على سؤال متاح')}<input type="search" value={search} maxLength={100} onChange={e=>setSearch(e.target.value)} placeholder={pick('Sleep, protein, notes…','نوم، بروتين، ملاحظات…')}/></label>
 {matches.length?groups.map(([id,en,arabic])=>{const rows=matches.filter(q=>q.group===id);return rows.length?<div className="question-group" key={id}><h3>{pick(en,arabic)}</h3><div className="query-shortcuts">{rows.map(q=><button type="button" key={q.id} disabled={disabled} onClick={()=>onChoose(ar?q.ar:q.en)}>{ar?q.ar:q.en}</button>)}</div></div>:null;}):<p role="status">{pick('No supported question matches. Try sleep, protein or notes.','مفيش سؤال مطابق. جرّب نوم أو بروتين أو ملاحظات.')}</p>}
 </details></div>;
}
